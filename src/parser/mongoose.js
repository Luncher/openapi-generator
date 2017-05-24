const config = require('../config')
const debug = require('debug')('openapi:parser:mongoose')
const TYPE_MAPPING = config.MONGOOSE_TYPE_MAPPING

function MongooseSchemaParser () {

}

MongooseSchemaParser.prototype.createDefinition = function (description = "") {
  const mapping = Object.create(null)
  mapping.type = 'object'
  mapping.required = []
  mapping.description = description
  mapping.properties = Object.create(null)

  return mapping
}

MongooseSchemaParser.prototype.parseArray = function (configure, definition, item, prop) {
  configure.type = 'array'
  if (item[0].type) {
    configure.items = { description: item[0].description }
    Object.assign(configure.items, TYPE_MAPPING[item[0].type.toLowerCase()])
  } else {
    configure.items = this.parseSchema(item[0])
  }

  return
}

MongooseSchemaParser.prototype.parseObject = function (configure, definition, item, prop) {
  configure.type = 'object'  
  const subConfig = this.parseSchema(item)
  configure.properties = subConfig.properties

  return
}

MongooseSchemaParser.prototype.parseDefault = function (configure, definition, item, prop) {
  Object.assign(configure, TYPE_MAPPING[item.type.toLowerCase()])
  if (item.required) {
    definition.required.push(prop)
  }
  configure.description = item.description || "该字段还没有注释"
  if (item.default) {
    configure.default = item.default
  }
  if (item.enum) {
    configure.enum = item.enum.slice()
  }

  return
}

MongooseSchemaParser.prototype.getType = function (item) {
  if (Array.isArray(item)) {
    return 'array'
  } else if (!item.type || typeof item.type === 'object') {
    return 'object'
  } else {
    return item.type.toLowerCase()
  }
}

MongooseSchemaParser.prototype.parseSchema = function (schema) {
  const definition = this.createDefinition()
  debug('schema:', schema)

  Object.keys(schema).forEach(prop => {
    const item = schema[prop]
    const type = this.getType(item)
    const configure = definition.properties[prop] = Object.create(null)
    switch(type) {
      case 'array': {
        this.parseArray(configure, definition, item, prop)
        break
      }
      case 'object': {
        this.parseObject(configure, definition, item, prop)
        break
      }
      default: {
        this.parseDefault(configure, definition, item, prop)
        break
      }
    }
  })

  //skip swagger validate error
  if (definition.required.length === 0) {
    delete definition.required
  }

  return definition
}

MongooseSchemaParser.prototype.parse = function (model) {
  const schema = model.schema
  const schemaObject = schema.obj
  return this.parseSchema(schemaObject)
}

module.exports = MongooseSchemaParser