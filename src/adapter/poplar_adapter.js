const assert = require('assert')
const config = require('../config');
const Entity = require('poplar').Entity

function PoplarSwaggerAdapter (APIRouter) {
  this.APIRouter = APIRouter
}

PoplarSwaggerAdapter.prototype.parseResponse = function (method, options) {
  const responses = Object.assign({}, config.DEFAULT_RESPONSE)
  const entity = method.presenter || (method.notes && method.notes.entity)
  const schema = method.notes && method.notes.schema
  // assert(Entity.isEntity(entity), 'presenter or notes.entity must be a valid Entity');
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
  options.createDefinition(definition)

  return Object.assign(responses, resp)
}

/**
 * 把response 的entity信息添加到method.notes里面
 */
PoplarSwaggerAdapter.prototype.parseMethod = function (tags, method, options) {
  const config = {
    tags,
    summary: method.name,
    description: method.name,
    verb: method.http.verb,
    operationId: method.http.path
  }
  const { createAction, createPath } = options  
  const pathName = '/' + method._apiBuilder.name + '/' + config.operationId
  const path = createPath({ name: pathName })

  const paramsIn = config.verb === 'GET' ? 'query' : 'body';      
  config.consumes = config.DEFAULT_CONSUMES
  config.produces = config.DEFAULT_PRODUCES
  config.parameters = method.accepts.map(paramter => {
    return {
      in: paramsIn,
      name: paramter.arg,
      type: paramter.type,
      description: paramter.description || "",
      schema: paramter.entity ? {"$ref": "#/definitions/" + paramter.entity} : {},
      required: paramter.required || (paramter.validates && paramter.validates.required)
    }
  })

  config.responses = this.parseResponse(method, options)

  return createAction(path, config)  
}

PoplarSwaggerAdapter.prototype.parse = function (options) {
  const APIRouter = this.APIRouter
  const { createTag, callOnDone } = options

  Object.keys(APIRouter._apiBuilders).forEach(tagName => {
    debug('apiBuilder name: ', tagName)
    debug('apiBuilder methods:')

    const apiBuilder = APIRouter._apiBuilders[tagName]
    const tag = createTag({ name: tagName, description: `The ${name} tag`})

    Object.keys(apiBuilder._methods).forEach(name => {
      const method = apiBuilder._methods[name]
      const action = this.parseMethod([tagName], method, options)
      debug('apiMethod name: ', name)
      debug('apiMethod description: ', method.description)    
      debug('apiMethod accepts: ', method.accepts)
      debug('apiMethod http: ', method.http)
    })
  })

  process.nextTick(callOnDone)
}

PoplarSwaggerAdapter.prototype.getBasePath = function () {
  return this.APIRouter.basePath
}

module.exports = PoplarSwaggerAdapter