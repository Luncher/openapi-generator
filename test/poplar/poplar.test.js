const fs = require('fs-extra')
const APIRouter = require('./api/api_routes').v1
const SWaggerGenerator = require('../../src/')
const PoplarAdapter = require('../../src/adapter/poplar_adapter')

const options = {
  type: 'json',
  version: 'v2',  
  host: '127.0.0.1',
  title: 'boqii test title',
  description: 'The test poplar',
}

const adapter = new PoplarAdapter({ APIRouter })
const generator = new SWaggerGenerator(options)
const spec = generator.generate(adapter)
fs.outputJsonSync('poplar-test-spec.json', spec)
// console.dir(spec, { depth: null })