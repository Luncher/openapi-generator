const MongoParser = require('./mongoose')
const SequelizeParser = require('./sequelize')
const EntityParser = require('./entity')

exports.parseMongoSchema = function (model) {
  const parser = new MongoParser()
  return parser.parse(model)
}

exports.parseSequelizeSchema = function (model) {
  const parser = new SequelizeParser()
  return parser.parse(model)
}

exports.parseEntity = function (definition, entity) {
  const parser = new EntityParser(definition, entity)
  return parser.parse(definition, entity)
}