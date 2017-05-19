const assert = require('assert')
const config = require('../config');
const Entity = require('poplar').Entity
const debug = require('debug')('openapi:adapter:poplar')

function PoplarSwaggerAdapter (options) {
  this.options = options
  this.APIRouter = options.APIRouter
}

PoplarSwaggerAdapter.prototype.parseResponse = function (method, parser) {
  const responses = Object.assign({}, config.DEFAULT_RESPONSE)
  const entity = method.presenter || (method.notes && method.notes.entity)
  const schema = method.notes && method.notes.schema
  // assert(Entity.isEntity(entity), 'presenter or notes.entity must be a valid Entity');

  if (!schema || !entity) {
    debug('using default response')
    return responses
  }

  const excepts = entity._excepts.slice()
  const exposes = entity._mappings
  const definition = {
    type: 'object',
    name: entity._name,
    properties: {}
  }

  Object.keys(schema)
    .concat(Object.keys(exposes))
    .forEach(k => {
      const conf = exposes[k] || schema[k]
      const type = conf.type.toLowerCase()
      const def = Object.assign({}, config.MONGOOSE_TYPE_MAPPING[type])
      if (conf.enum) {
        def.enum = conf.enum
      }
      if (conf.default) {
        def.default = conf.default
      }
      definition.properties = Object.assign(definition.properties, def)
    })
  
  //remove alias key
  Object.keys(exposes).forEach(k => {
    if (exposes[k].act === 'alias') {
      definition.properties[exposes[k].name] = definition.properties[k]
      delete definition.properties[k]      
    }
  })

  //remove excepts field
  exports.forEach(k => {
    delete definition.properties[k]    
  })

  const resp = {
    "200": {
      "description": "successful operation",
      "schema": {
        "$ref": "#/definitions/" + definition.name
      }
    }
  }
  //TODO parse nested array 、 object、entity using
  parser.createDefinition(definition)

  return Object.assign(responses, resp)
}

PoplarSwaggerAdapter.prototype.parsePathTemplateParams = function (method) {
  debug('http: ', method.http)
  debug('http.path: ', method.http.path)
  return method.http.path.split('/')
  .filter(it => it && it[0] === ':')
  .map(it => it.slice(1))
  .map(it => {
    return {
      in: 'path',
      name: it,
      required: true
    }
  })
}

PoplarSwaggerAdapter.prototype.parseQueryParams = function (tags, method, parser) {
  const pathParams = this.parsePathTemplateParams(method)

  return method.accepts.map(paramter => {
    const pathParamter = pathParams.find(it => it.name === paramter.arg)
    const defaultConf = {
      in: 'query',
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
  const parameter = {
    in: 'body',
    name: "data",
    description: method.name + ' params'
  }
  const definition = {
    type: 'object',
    required: [],    
    name: tags[0] + method.name,
  }
  
  definition.properties = method.accepts.reduce((acc, paramter) => {
    const conf = {}
    if (Array.isArray(paramter.type)) {
      conf.type = 'array'
      conf.items = {
        type: paramter.type[0]
      }
    } else {
      conf.type = paramter.type
    }
    if (paramter.required || (paramter.validates && paramter.validates.required)) {
      definition.required.push(paramter.arg)
    }
    acc[paramter.arg] = conf
    return acc
  }, {})

  parser.createDefinition(definition)
  parameter.schema = { $ref: '#/definitions/' + definition.name }

  return [parameter]
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

  const pathName = '/' + method._apiBuilder.name + (conf.operationId ? ('/' + conf.operationId) : '')
  const path = parser.createPath({ name: pathName })

  switch(this.parseParamsIn(method)) {
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

  Object.keys(APIRouter._apiBuilders).forEach(tagName => {
    debug('apiBuilder name: ', tagName)
    const apiBuilder = APIRouter._apiBuilders[tagName]
    const tag = parser.createTag({ name: tagName, description: `The ${tagName} tag`})

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