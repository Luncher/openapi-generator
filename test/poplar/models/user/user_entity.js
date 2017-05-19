const Entity = require('../entity')

const userEntity = new Entity({
  _id: { as: 'id', type: 'string' }
})

userEntity.excepts('_id', 'birthday');

module.exports = userEntity