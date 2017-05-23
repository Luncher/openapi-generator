const Entity = require('../entity')
const UserAddressSimple = require('./user_address_simple')

const userEntity = new Entity('UserEntity')

userEntity.define({
  // test as
  name: { as: 'asName', type: 'string', description: '用户名' },
  // test using
  addresses: { using: UserAddressSimple, description: '用户地址' },
  // test get
  followersCount: { get: 'statistics.followersCount', default: 0, description: '关注人数' },
  // test value
  testValue: { value: 'testValue', description: '测试值' }
})

userEntity.expose('wechat', { type: 'number', description: '微信' }, function(obj) {
  return obj.socials.wechat? obj.socials.wechat.nickname : '';
});

userEntity.excepts('_id', 'birthday');

module.exports = userEntity