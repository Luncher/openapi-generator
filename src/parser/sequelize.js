const definition = require('sequelize-json-schema')
const config = require('../config')
const debug = require('debug')('openapi:parser:sequelize')

function SequelizeSchemaParser () {

}

SequelizeSchemaParser.prototype.parse = function (model) {
  const result = definition(model)
  return result
}

module.exports = SequelizeSchemaParser