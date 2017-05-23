const glob = require('glob')
const path = require('path')
const poplar = require('poplar')
const debug = require('debug')('swagger-test:api-routes')

function apiCreator (version, options = {}) {
  const basePath = '/api/v' + version
  const api = poplar.create({
    basePath,
    cors: {
      origin: true,
      credentials: true
    }
  })
  const apiFiles = './controllers/v' + version + '/**/*_api.js';  
  const files = glob.sync(path.join(__dirname, apiFiles))
  debug('api files: ', files)
  files.forEach(file => {
    debug('require file: ' + file)
    api.use(require(file))
  })

  api.rest = api.handler('rest', {})
  return api
}

const apiV1 = apiCreator(1.1)

module.exports = { v1: apiV1 }