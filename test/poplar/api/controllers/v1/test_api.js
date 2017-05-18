const poplar = require('poplar')
const testAPI = new poplar.ApiBuilder('test');

/**
 * not supported:
* { arg: 'body', type: ['object'], description: '文章内容（图文混排）' }
* { arg: 'str', type: [['string']], description: '文章内容（图文混排）' }
*/
testAPI.define('getindex', {
  description: 'test api index action',
  accepts: [
    { arg: 'name', type: 'string', description: '名称' },    
    { arg: 'index', type: 'number', description: '索引', default: 1, required: true },
    { arg: 'images', type: ['string'], description: '图片数组', validates: { required: true } },
  ],
  http: { path: '', verb: 'get' }
}, function (params, cb) {
  cb(null, "hello world")
})

testAPI.define('postindex', {
  description: 'test api index action',
  accepts: [
    { arg: 'name', type: 'string', description: '名称', required: true },    
    { arg: 'index', type: 'number', description: '索引', default: 1, required: true },
    { arg: 'images', type: ['string'], description: '图片数组', validates: { required: true } },
  ],
  http: { path: '', verb: 'post' }
}, function (params, cb) {
  cb(null, "hello world")
})

// testAPI.
module.exports = testAPI