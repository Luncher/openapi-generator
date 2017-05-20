const config = require('./config')
const YamlParser = require('js-yaml')
const debug = require('debug')('openapi:parser')

//refs http://swagger.io/specification/

/**
 * @param {*} APIRouter 
 * @param {*} options 
 */
function SWaggerGenerator (options) {
  this.options = options
  this.type = options.type
  this.init()
}

SWaggerGenerator.prototype.init = function () {
  this.configure = {}
  this.configure.tags = []
  this.configure.paths = {}
  this.configure.definitions = {}
  this.configure.securityDefinitions = {}
  this.configure.host = this.options.host
  this.configure.swagger = config.SWAGGER_VERSION
  this.configure.schemes = this.options.schemes || config.DEFAULT_SCHEMES
  this.configure.info = {}
  this.configure.info.description = this.options.description
  this.configure.info.version = this.options.version
  this.configure.info.title = this.options.title

  const externalProps = ['contact', 'license', 'externalDocs']
  externalProps.forEach(prop => {
    if (this.options[prop]) {
      this.configure[prop] = this.options[prop]
    }
  })
}

SWaggerGenerator.prototype.setProperty = function (k, v) {
  this.configure[k] = v;
  return this
}

SWaggerGenerator.prototype.toJSON = function () {
  const result = JSON.parse(JSON.stringify(this.configure))
  result.tags = this.configure.tags.map(tag => {
    return tag.toJSON()
  })
  result.paths = Object.keys(this.configure.paths).reduce((acc, cur) => {
    return Object.assign(acc, this.configure.paths[cur].toJSON())
  }, {})
  result.securityDefinitions = Object.keys(this.configure.securityDefinitions).reduce((acc, cur) => {
    return Object.assign(acc, this.configure.securityDefinitions[cur].toJSON())
  }, {})
  result.definitions = Object.keys(this.configure.definitions).reduce((acc, cur) => {
    return Object.assign(acc, this.configure.definitions[cur].toJSON())
  }, {})

  return result
}

SWaggerGenerator.prototype.toYAML = function () {
  const result = this.toJSON()
  return YamlParser.dump(result)
}

SWaggerGenerator.prototype.createTag = function (options) {
  const configure = this.configure;  
  const tag = new SWaggerGenerator.Tag(options)
  configure.tags.push(tag)
  return tag
}

SWaggerGenerator.prototype.createPath = function (options) {
  const configure = this.configure;  
  const path = configure.paths[options.name] || 
    new SWaggerGenerator.Path(options)
  configure.paths[options.name] = path
  return path
}

SWaggerGenerator.prototype.createAction = function (path, options) {
  const configure = this.configure;  
  const action = new SWaggerGenerator.Action(options)
  path.addAction(action)
  return action 
}

SWaggerGenerator.prototype.createSecrity = function (options) {
  const configure = this.configure;
  const security = new SWaggerGenerator.Security(options)
  configure.securityDefinitions[options.name] = security
  return security
}

SWaggerGenerator.prototype.createDefinition = function (options) {
  const configure = this.configure;
  const definition = new SWaggerGenerator.Definition(options)
  configure.definitions[options.name] = definition
  return definition
}

SWaggerGenerator.prototype.generate = function (adapter, onDone) {
  const basePath = adapter.getBasePath()
  this.setProperty('basePath', basePath)

  adapter.parse(this)
  if (this.type === 'yaml') {
    return this.toYAML()
  } else {
    return this.toJSON()
  }
}

SWaggerGenerator.Tag = function (options) {
  this.name = options.name
  this.description = options.description
}

SWaggerGenerator.Tag.prototype.toJSON = function () {
  return {
    name: this.name,
    description: this.description
  }
}

SWaggerGenerator.Path = function (options) {
  this.actions = {}
  this.name = options.name
}

SWaggerGenerator.Path.prototype.addAction = function (action) {
  this.actions[action.name] = action
}

SWaggerGenerator.Path.prototype.toJSON = function () {
  const actions = Object.keys(this.actions).reduce((acc, name) => {
    return Object.assign(acc, { [name]: this.actions[name].toJSON() })
  }, {})
  return { [this.name]: actions }
}

SWaggerGenerator.Action = function (options) {
  this.name = options.name
  this.tags = options.tags
  this.summary = options.summary
  this.description = options.description
  this.operationId = options.operationId
  this.responses = options.responses || {}
  this.security = options.security || []
  this.parameters = options.parameters || []
  this.consumes = options.consumes || ["application/json"]
  this.produces = options.produces || ["application/json"]
}

SWaggerGenerator.Action.prototype.addParameter = function (options) {
  const params = {
    in: options.in || 'body',
    verb: options.verb,
    description: options.description || "",
    required: options.required,
    schema: options.schema,
  }
  this.parameters.push(params)
  return this
}

SWaggerGenerator.Action.prototype.addTags = function (tag) {
  this.tags.push(tag.name)
  return this
}

SWaggerGenerator.Action.prototype.addResponse = function (options) {
  this.responses = Object.assign(this.responses, options)  
  return this
}

SWaggerGenerator.Action.prototype.addSecurity = function (options) {
  this.security = Object.assign(this.security, options)
  return this
}

SWaggerGenerator.Action.prototype.toJSON = function () {
  return {
      tags:  this.tags,
      summary: this.summary,
      description: this.description,
      consumes: this.consumes,
      produces: this.produces,
      parameters: this.parameters,
      responses: this.responses,
      security: this.security
  }
}

SWaggerGenerator.Security = function (options) {
  this.name = options.name
  this.type = options.type
  this.flow = options.implicit
  this.scopes = options.scopes || {}
  this.authorizationUrl = options.authorizationUrl || ""  
}

SWaggerGenerator.Security.prototype.addScope = function (scope) {
  this.scopes = Object.assign(this.scopes, scope)
  return this
}

SWaggerGenerator.Security.prototype.toJSON = function () {
  return { 
    [this.name]: {
      type: this.type,
      authorizationUrl: this.authorizationUrl,
      flow: this.flow,
      scopes: this.scopes
    }
  }
}

SWaggerGenerator.Definition = function (options) {
  this.name = options.name
  this.type = options.type
  this.required = options.required
  this.description = options.description || ""
  this.properties = options.properties || {}

  return this
}

SWaggerGenerator.Definition.prototype.addProperty = function (options) {
  const prop = this.properties[options.name] || {}
  Object.keys(options)
  .filter(name => name !== 'name')
  .forEach(name => {
    prop[name] = options[name]
  })
  this.properties[options.name] = prop

  return this
}

SWaggerGenerator.Definition.prototype.toJSON = function () {
  const json = Object.keys(this).filter(k => k !== 'name').reduce((acc, cur) => {
    acc[cur] = this[cur]
    return acc
  }, {})
  return { [this.name]: json }
}

module.exports = SWaggerGenerator