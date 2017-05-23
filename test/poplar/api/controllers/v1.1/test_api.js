const poplar = require('poplar')
const userAPI = new poplar.ApiBuilder('test')
const userModel = require('../../../models/user/user')
const actionModel = require('../../../models/user/action')
const userEntity = require('../../../models/user/user_entity')
const userAddrEntity = require('../../../models/user/user_address_simple')

userAPI.define('getindex', {
  description: 'test api index action',
  accepts: [
    { arg: 'name', type: 'string', description: '名称' },    
    { arg: 'index', type: 'number', description: '索引', default: 1, required: true },
    { arg: 'images', type: ['string'], description: '图片数组', validates: { required: true } },
  ],
  notes: { schema: actionModel.schema , entity: userAddrEntity },
  http: { path: '', verb: 'get' }
}, function (params, cb) {
  cb(null, "hello world")
})

// userAPI.define('getUserAddress', {
//   description: 'getUserAddress method',
//   accepts: [
//     { arg: 'uid', type: 'string', description: '用户uid' },    
//   ],
//   notes: { entity: userAddrEntity },
//   http: { path: '/address/:uid', verb: 'get' }
// }, function (params, cb) {
//   cb(null, "hello world")
// })

// userAPI.define('postindex', {
//   description: 'test api index action',
//   accepts: [
//     { arg: 'name', type: 'string', description: '名称', required: true },    
//     { arg: 'index', type: 'number', description: '索引', default: 1, required: true },
//     { arg: 'images', type: ['string'], description: '图片数组', validates: { required: true } },
//   ],
//   http: { path: '', verb: 'post' }
// }, function (params, cb) {
//   cb(null, "hello world")
// })

// userAPI.define('foorbar', {
//   description: 'test path templating action',
//   accepts: [
//     { arg: 'bar', type: 'string', description: 'barbar', required: true } 
//   ],
//   http: { path: 'foo/:bar', verb: 'get' }
// }, function (params, cb) {
//   cb(null, "hello world")
// })

// userAPI.define('deleteuser', {
//   description: 'test path templating action',
//   accepts: [
//     { arg: 'id', type: 'string', description: 'user id', required: true }
//   ],
//   http: { path: 'user/:id', verb: 'delete' }
// }, function (params, cb) {
//   cb(null, "hello world")
// })

// userAPI.define('patchuser', {
//   description: 'test path templating action',
//   accepts: [
//     { arg: 'id', type: 'string', description: 'user id', required: true },
//     { arg: 'name', type: 'string', description: 'user name' },
//     { arg: 'email', type: 'string', description: 'user email', required: true },
//   ],
//   http: { path: 'user/:id', verb: 'patch' }
// }, function (params, cb) {
//   cb(null, "hello world")
// })

// userAPI.
module.exports = userAPI