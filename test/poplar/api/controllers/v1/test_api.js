const poplar = require('poplar')
const userAPI = new poplar.ApiBuilder('test')
const userModel = require('../../../models/user/user')
const userEntity = require('../../../models/user/user_entity')

/**
 * not supported:
* { arg: 'body', type: ['object'], description: '文章内容（图文混排）' }
* { arg: 'str', type: [['string']], description: '文章内容（图文混排）' }
*/
userAPI.define('getindex', {
  description: 'test api index action',
  accepts: [
    { arg: 'name', type: 'string', description: '名称' },    
    { arg: 'index', type: 'number', description: '索引', default: 1, required: true },
    { arg: 'images', type: ['string'], description: '图片数组', validates: { required: true } },
  ],
  notes: { schema: userModel.schema , entity: userEntity },
  http: { path: '', verb: 'get' }
}, function (params, cb) {
  cb(null, "hello world")
})

userAPI.define('postindex', {
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

userAPI.define('foorbar', {
  description: 'test path templating action',
  accepts: [
    { arg: 'bar', type: 'string', description: 'barbar', required: true } 
  ],
  http: { path: 'foo/:bar', verb: 'get' }
}, function (params, cb) {
  cb(null, "hello world")
})

// userAPI.
module.exports = userAPI