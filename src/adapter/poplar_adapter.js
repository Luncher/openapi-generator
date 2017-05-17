const DEFAULT_CONSUMES = [
  'application/json',
  'application/x-www-form-urlencoded'
]

const DEFAULT_PRODUCES = [
  'application/json'  
]

const DEFAULT_RESPONSE = {
  "405": {
    "description": "Invalid input"
  }
}

function PoplarSwaggerAdapter (APIRouter) {
  this.APIRouter = APIRouter
}

PoplarSwaggerAdapter.prototype.parseEntity = function (name) {

}

PoplarSwaggerAdapter.prototype.parseMethod = function (path, method, options) {
  const { createDefinition } = options
  const config = {
    tags: [],
    summary: method.name,
    description: method.name,
    verb: method.http.verb,
    description: method.description,
    operationId: method.http.path
  }

  const paramsIn = config.verb === 'GET' ? 'query' : 'body';      
  config.consumes = DEFAULT_CONSUMES
  config.produces = DEFAULT_PRODUCES
  config.parameters = method.accepts.map(paramter => {
    if (paramter.entity) {
      createDefinition(this.parseEntity(paramter.entity))
    }
    return {
      in: paramsIn,
      name: paramter.arg,
      type: paramter.type,
      description: paramter.description || "",
      schema: paramter.entity ? {"$ref": "#/definitions/" + paramter.entity} : {},
      required: paramter.required || (paramter.validates && paramter.validates.required)
    }
  })

  return createAction(path, config)  
}

PoplarSwaggerAdapter.prototype.parse = function (options) {
  const APIRouter = this.APIRouter
  const { 
    createTag,
    createPath,
    createAction,
    createSecrity,
    createDefinition,
    setProperty,
    callOnDone
  } = options

  Object.keys(APIRouter._apiBuilders).forEach(name => {
    debug('apiBuilder name: ', name)
    debug('apiBuilder methods:')

    const path = createPath({ name })
    const apiBuilder = APIRouter._apiBuilders[name]

    Object.keys(apiBuilder._methods).forEach(name => {
      const method = apiBuilder._methods[name]
      const action = this.parseMethod(path, [tag], method, options)
      debug('apiMethod name: ', name)
      debug('apiMethod description: ', method.description)    
      debug('apiMethod accepts: ', method.accepts)
      debug('apiMethod http: ', method.http)
    })
  })
}

PoplarSwaggerAdapter.prototype.getBasePath = function () {
  return this.APIRouter.basePath
}

module.exports = PoplarSwaggerAdapter