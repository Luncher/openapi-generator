const MongoParser = require('./mongoose')
const SequelizeParser = require('./sequelize')

exports.parseMongoSchema = function (model) {
  const parser = new MongoParser()
  return parser.parse(model)
}

exports.parseSequelizeSchema = function (model) {
  const parser = new SequelizeParser()
  return parser.parse(model)
}