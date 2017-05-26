function EntityParser() {

}

EntityParser.prototype.parseMapping = function (definition, mappings) {
  const aliasFields = []
  const properties = definition.properties
  const entityProps = Object.keys(mappings)
  .reduce((props, k) => {
    let type
    const fieldProp = {}
    const it = mappings[k]
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
        if (value) {
          type = value.type
        }
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
    props[k] = fieldProp
    return props
  }, {})

  function getNestedProp (obj, fieldPath) {
    const fields = fieldPath.split('.')
    return fields.reduce((acc, k) => {
      if (acc && acc.properties) {
        return acc.properties[k]
      }
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

EntityParser.prototype.parse = function (definition, entity) {
  const entityProps = this.parseMapping(definition, entity._mappings)

  Object.assign(definition.properties, entityProps)
  definition.properties = Object.keys(definition.properties)
    .filter(k => entity._excepts.indexOf(k) === -1)
    .reduce((acc, cur) => {
      acc[cur] = definition.properties[cur]
      return acc
    }, {})
  
  if (definition.required) {
    definition.required = definition.required.filter(k => entity._excepts.indexOf(k) === -1)
  }

  return definition
}

module.exports = EntityParser