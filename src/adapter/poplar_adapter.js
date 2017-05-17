function PoplarSwaggerAdapter (APIRouter) {
  this.APIRouter = APIRouter
}

PoplarSwaggerAdapter.prototype.parse = function () {
  const APIRouter = this.APIRouter
  Object.keys(APIRouter._apiBuilders).forEach(name => {
    debug('apiBuilder name: ', name)
    debug('apiBuilder methods:')
    const apiBuilder = APIRouter._apiBuilders[name]
    Object.keys(apiBuilder._methods).forEach(name => {
      debug('apiMethod name: ', name)
      const apiMethod = apiBuilder._methods[name]
      debug('apiMethod description: ', apiMethod.description)    
      debug('apiMethod accepts: ', apiMethod.accepts)
      debug('apiMethod http: ', apiMethod.http)
    })
  })
}

PoplarSwaggerAdapter.prototype.getBasePath = function () {
  return this.APIRouter.basePath
}

module.exports = PoplarSwaggerAdapter