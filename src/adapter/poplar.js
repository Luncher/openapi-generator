const assert = require('assert')
const config = require('../config');
const debug = require('debug')('openapi:adapter:poplar')

const DEFAULT_RESPONSE_DEFINITION = {
  name: 'ApiResponse',
  description: '默认输出数据格式',
  type: 'object',
  required: ['status', 'message'],
  properties: {
    'status': {
      type: 'number',
      enum: [0, 1, 2]
    },
    "message": {
      type: 'string'
    },
    "metadata": {
      type: 'object',
      description: '分页信息',
      properties: {
        'maxid': {
          type: 'string'          
        },
        'minid': {
          type: 'string'
        },
        'count': {
          type: 'number'
        }
      }
    },
    "errors": {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    "data": {
      type: 'object'
    }
  }
}

//||支持普通的entity操作
// 1. using
// 2. alias
// 3. value
// 4. get
// 5. description

function PoplarSwaggerAdapter(options) {
  this.options = options
  this.APIRouter = options.APIRouter
}

PoplarSwaggerAdapter.prototype.init = function (parser) {
  parser.createDefinition(DEFAULT_RESPONSE_DEFINITION)  
}

PoplarSwaggerAdapter.prototype.parseMongoSchema = function (root) {
  const definition = {
    type: "object",
    properties: {},
    required: [],
    description: root.description || ""
  }

  Object.keys(root)
    .forEach(k => {
      const item = root[k]
      definition.properties[k] = {}
      const itemDef = definition.properties[k]

      if (Array.isArray(item)) {
        itemDef.type = 'array'
        itemDef.items = this.parseMongoSchema(item[0])
      } else if (!item.type) {
        itemDef.type = 'object'
        const subConfig = this.parseMongoSchema(item)
        itemDef.properties = subConfig.properties
      } else {
        Object.assign(itemDef, config.MONGOOSE_TYPE_MAPPING[item.type.toLowerCase()])
        if (item.required) {
          definition.required.push(k)
        }
        if (item.description) {
          itemDef.description = item.description
        }
        if (item.default) {
          itemDef.default = item.default
        }
        if (item.enum) {
          itemDef.enum = item.enum
        }
      }
    })

  return definition
}

PoplarSwaggerAdapter.prototype.createDefaultDefinition = function (name, description) {
  return {
    type: "object",
    properties: {},
    name,
    description
  }
}

PoplarSwaggerAdapter.prototype.parseEntityMapping = function (definition, entity) {
  const mappings = entity._mappings
  const properties = definition.properties

  debug('parseEntityMapping')
  debug('properties', properties)
  
  const aliasFields = []
  const entityProps = Object.keys(mappings)
  .reduce((props, k) => {
    let type
    const fieldProp = {}
    const it = mappings[k]
    debug('parse entity field: ' + k)
    debug('parse entity config:', it)    
    switch(it.act) {
      case 'alias': {
        if (it.using) {
          const entity = it.using
          fieldProp['$ref'] = '#/definitions/' + entity._name
        } else {
          const name = it.value
          type = (properties[name] && properties[name].type) || it.type
          aliasFields.push(name)
        }
        break
      }
      case 'get': {
        const fieldPath = it.value
        const value = getNestedProp(definition, fieldPath)
        type = value.type
        break
      }
      case 'value': {
        it.default = it.value
        break
      }
      case 'function': {
        type = it.type
        break
      }
    }

    type = type === 'any' ? 'string': type
    if (type) {
      fieldProp.type = type
    }
    if (it.description) {
      fieldProp.description = it.description
    }

    if (it.default !== null) {
      fieldProp.default = it.default
      if (!type) {
        fieldProp.type = mappingDefaultType(it.default)
      }
    }
    debug('type: ', type)
    debug('field: ', k)
    debug('fieldProp:', fieldProp)
    props[k] = fieldProp
    return props
  }, {})

  function getNestedProp (obj, fieldPath) {
    const fields = fieldPath.split('.')
    return fields.reduce((acc, k) => {
      return acc.properties[k]
    }, obj)
  }

  function mappingDefaultType (value) {
    if (value === 0) {
      return "number"
    } else if (!value) {
      return 'string'
    } else if (Array.isArray(value)) {
      return 'array'
    } else {
      return typeof value
    }
  }

  return entityProps
}

PoplarSwaggerAdapter.prototype.parseEntity = function (definition, entity) {
  const excepts = entity._excepts.slice()
  const entityProps = this.parseEntityMapping(definition, entity)

  debug('parseEntity')

  Object.assign(definition.properties, entityProps)
  definition.properties = Object.keys(definition.properties)
    .filter(k => excepts.indexOf(k) === -1)
    .reduce((acc, cur) => {
      acc[cur] = definition.properties[cur]
      return acc
    }, {})

  return definition
}

PoplarSwaggerAdapter.prototype.parseResponse = function (method, parser) {
  const responses = Object.assign({}, config.DEFAULT_RESPONSE)
  const entity = method.presenter || (method.notes && method.notes.entity)
  const schema = method.notes && method.notes.schema
  
  if (!schema && !entity) {
    debug('using default response')
    return responses
  }

  const self = this
  function createAPIEntity () {
    let definition
    const definitionName = entity._name

    definition = parser.getDefinition(definitionName)
    if (!definition) {
      if (schema) {
        definition = self.parseMongoSchema(schema.obj)
      } else {
        definition = self.createDefaultDefinition()
      }
      definition.name = definitionName
      definition = self.parseEntity(definition, entity)
      parser.createDefinition(definition)      
    }

    return definition
  }

  assert(entity, 'entity must exists')
  const definition = createAPIEntity()

  const resp = {
    "200": {
      "description": "successful operation",
      "schema": {
        "$ref": "#/definitions/" + definition.name
      }
    }
  }

  return Object.assign(responses, resp)
}

PoplarSwaggerAdapter.prototype.parsePathTemplateParams = function (method) {
  return method.http.path.split('/')
    .filter(it => it && it[0] === ':')
    .map(it => it.slice(1))
    .map(it => {
      return { in: 'path',
        name: it,
        required: true
      }
    })
}

PoplarSwaggerAdapter.prototype.parseQueryParams = function (tags, method, parser) {
  const pathParams = this.parsePathTemplateParams(method)

  return method.accepts.map(paramter => {
    const pathParamter = pathParams.find(it => it.name === paramter.arg)
    const defaultConf = { in: 'query',
      name: paramter.arg,
      required: (paramter.required || (paramter.validates && paramter.validates.required) || false)
    }
    const conf = pathParamter || defaultConf
    conf.description = paramter.description || ""
    if (paramter.default) {
      conf.default = paramter.default
    }

    if (Array.isArray(paramter.type)) {
      conf.type = 'array'
      conf.items = {
        type: paramter.type[0]
      }
    } else {
      conf.type = paramter.type
    }
    return conf
  })
}

PoplarSwaggerAdapter.prototype.parseBodyParams = function (tags, method, parser) {
  const definition = {
    type: 'object',
    required: [],
    name: tags[0] + method.name,
  }

  const pathParams = this.parsePathTemplateParams(method)
  definition.properties = method.accepts.reduce((acc, paramter) => {
    let conf = {}
    const pathParamter = pathParams.find(it => it.name === paramter.arg)
    if (pathParamter) {
      pathParamter.type = paramter.type
      return acc
    }
    if (Array.isArray(paramter.type)) {
      conf.type = 'array'
      conf.items = {
        type: paramter.type[0]
      }
    } else {
      conf.type = paramter.type
    }
    if (paramter.default) {
      conf.default = paramter.default
    }
    if (paramter.required || (paramter.validates && paramter.validates.required)) {
      definition.required.push(paramter.arg)
    }
    acc[paramter.arg] = conf
    return acc
  }, {})
  
  const parameters = [...pathParams]
  if (Object.keys(definition.properties).length > 0) {
    parameters.push({ in: 'body',
      name: "data",
      schema: {
        $ref: '#/definitions/' + definition.name
      },
      description: method.name + ' params'
    })
    parser.createDefinition(definition)    
  }

  return parameters
}

PoplarSwaggerAdapter.prototype.parseOperation = function (method) {
  return String(method.http.path).split('/').map(it => {
    if (it && it[0] === ':') {
      return '{' + it.slice(1) + '}'
    } else {
      return it
    }
  }).join('/')
}

PoplarSwaggerAdapter.prototype.parseParamsIn = function (method) {
  const verb = method.http.verb
  
  if (verb.toLowerCase() === 'get') {
    return 'query'
  } else {
    return 'body'
  }
}

// 1. path template
// 2. parse response
// 3. generate ui
// 4. generate code stub
PoplarSwaggerAdapter.prototype.parseMethod = function (tags, method, parser) {
  const conf = {
    tags,
    summary: method.name,
    description: method.name,
    verb: method.http.verb,
    name: method.http.verb,
    consumes: config.DEFAULT_CONSUMES,
    produces: config.DEFAULT_PRODUCES,
    operationId: this.parseOperation(method)
  }

  const pathName = '/' + method._apiBuilder.name + 
    (conf.operationId ? ( (conf.operationId.indexOf('/') === 0 ? '' : '/') + conf.operationId) : '')
  const path = parser.createPath({
    name: pathName
  })

  switch (this.parseParamsIn(method)) {
    case 'query': {
      conf.parameters = this.parseQueryParams(tags, method, parser)
      break
    }
    case 'body': {
      conf.parameters = this.parseBodyParams(tags, method, parser)
      break
    }
    case 'header': {
      break
    }
    case 'form': {
      break
    }
    default: {
      break
    }
  }

  conf.responses = this.parseResponse(method, parser)

  return parser.createAction(path, conf)
}

PoplarSwaggerAdapter.prototype.parse = function (parser) {
  const APIRouter = this.APIRouter

  this.init(parser)
  Object.keys(APIRouter._apiBuilders).forEach(tagName => {
    debug('apiBuilder name: ', tagName)
    const apiBuilder = APIRouter._apiBuilders[tagName]
    const tag = parser.createTag({
      name: tagName,
      description: `The ${tagName} tag`
    })

    Object.keys(apiBuilder._methods).forEach(name => {
      const method = apiBuilder._methods[name]
      const action = this.parseMethod([tagName], method, parser)
    })
  })

  return
}

PoplarSwaggerAdapter.prototype.getBasePath = function () {
  return this.APIRouter.basePath
}

module.exports = PoplarSwaggerAdapter