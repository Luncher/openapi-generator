const poplar = require('poplar')
const testAPI = new poplar.ApiBuilder('test');

testAPI.define('index', {
  description: 'test api index action',
  accepts: [
    { arg: 'name', type: 'string', description: '测试名', required: true }
  ],
  http: { path: '', verb: 'get' }
}, function (params, cb) {
  cb(null, "hello world")
})

// testAPI.
module.exports = testAPI