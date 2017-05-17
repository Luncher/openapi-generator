const YamlParser = require('js-yaml')
const debug = require('debug')('swagger-test:parser')

//refs http://swagger.io/specification/
const SWAGGER_VERSION = "2.0"

/**
 * @param {*} APIRouter 
 * @param {*} options 
 */
function SWaggerGenerate (options) {
  this.options = options
  this.type = options.type
  this.init()
}

SWaggerGenerate.prototype.init = function () {
  this.configure = {}
  this.configure.tags = []
  this.configure.paths = {}
  this.configure.definitions = {}
  this.configure.securityDefinitions = {}
  this.configure.externalDocs = this.options.externalDocs || {}
  this.configure.host = this.options.host
  this.configure.swagger = SWAGGER_VERSION
  this.configure.schemes = this.options.schemes || ['http']
  this.configure.info = {}
  this.configure.info.description = this.options.description
  this.configure.info.version = this.options.version
  this.configure.info.title = this.options.title
  this.configure.contact = this.options.contact || {}
  this.configure.license = this.options.license || {}
}

SWaggerGenerate.prototype.set = function (k, v) {
  this.configure[k] = v;
  return this
}

SWaggerGenerate.prototype.toJSON = function () {
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

SWaggerGenerate.prototype.toYaml = function () {
  const result = this.toJSON()
  return YamlParser.dump(result)
}

SWaggerGenerate.prototype.run = function (adapter, onDone) {
  const that = this
  const configure = this.configure;

  const basePath = adapter.getBasePath()
  this.set('basePath', basePath)

  function callOnCreateTag (options) {
    const tag = new SWaggerGenerate.Tag(options)
    configure.tags.push(tag)
    return tag
  }

  function callOnCreatePath (options) {
    const path = new SWaggerGenerate.Path(options)
    configure.paths[options.name] = path
    return path
  }

  function callOnCreateAction (path, options) {
    const action = new SWaggerGenerate.Action(options)
    path.addAction(action)
    return action
  }

  function callOnCreateSecurityDefinition (options) {
    const security = new SWaggerGenerate.Security(options)
    configure.securityDefinitions[options.name] = security
    return security
  }

  function callOnCreateDefinition (options) {
    const definition = new SWaggerGenerate.Definition(options)
    configure.definitions[options.name] = definition
    return definition
  }

  function setProperty (k, v) {
    return that.set(k, v)
  }

  function callOnDone (err) {
    if (err) {
      onDone(err)
    } else if (that.type === 'json') {
      onDone(null, that.toJSON())
    } else {
      onDone(null, that.toYaml())
    }
  }

  adapter.parse({
    createTag: callOnCreateTag,
    createPath: callOnCreatePath,
    createAction: callOnCreateAction,
    createSecrity: callOnCreateSecurityDefinition,
    createDefinition: callOnCreateDefinition,
    setProperty,    
    callOnDone
  })

  return
}

SWaggerGenerate.Tag = function (options) {
  this.name = options.name
  this.description = options.description
}

SWaggerGenerate.Path = function (options) {
  this.actions = {}
  this.name = options.name
}

SWaggerGenerate.Path.prototype.addAction = function (action) {
  this.actions.push(action)
}

SWaggerGenerate.Path.prototype.toJSON = function () {
  const actions = this.actions.reduce((acc, action) => {
    return Object.assign(acc, action.toJSON())
  }, {})
  return { ["/" + this.name]: actions }
}

SWaggerGenerate.Action = function (options) {
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

SWaggerGenerate.Action.prototype.addParameter = function (options) {
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

SWaggerGenerate.Action.prototype.addTags = function (tag) {
  this.tags.push(tag.name)
  return this
}

SWaggerGenerate.Action.prototype.addResponse = function (options) {
  this.responses = Object.assign(this.responses, options)  
  return this
}

SWaggerGenerate.Action.prototype.addSecurity = function (options) {
  this.security = Object.assign(this.security, options)
  return this
}

SWaggerGenerate.Action.prototype.toJSON = function () {
  return {
    [this.verb]: {
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
}

SWaggerGenerate.Security = function (options) {
  this.name = options.name
  this.type = options.type
  this.flow = options.implicit
  this.scopes = options.scopes || {}
  this.authorizationUrl = options.authorizationUrl || ""  
}

SWaggerGenerate.Security.prototype.addScope = function (scope) {
  this.scopes = Object.assign(this.scopes, scope)
  return this
}

SWaggerGenerate.Security.prototype.toJSON = function () {
  return { 
    [this.name]: {
      type: this.type,
      authorizationUrl: this.authorizationUrl,
      flow: this.flow,
      scopes: this.scopes
    }
  }
}

SWaggerGenerate.Definition = function (options) {
  this.name = options.name
  this.type = options.type
  this.properties = options.properties || {}

  return this
}

SWaggerGenerate.Definition.prototype.addProperty = function (options) {
  const prop = this.properties[options.name] || {}
  Object.keys(options)
  .filter(name => name !== 'name')
  .forEach(name => {
    prop[name] = options[name]
  })
  this.properties[options.name] = prop

  return this
}

SWaggerGenerate.Definition.prototype.toJSON = function () {
  return { [this.name]: Object.assign({}, this) }
}

module.exports = SWaggerGenerate