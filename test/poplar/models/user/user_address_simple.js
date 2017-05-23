'use strict';

const Entity = require('../entity')

const UserAddressSimple = new Entity('UserAddressSimple', {
  _id: { as: 'id' },
  name: { default: '' },
  address: { default: '' },
  fullAddress: { default: '' },
  telephone: { default: '' },
  postcode: { default: '' }
});

UserAddressSimple.excepts('_id', 'telephone');

UserAddressSimple.expose('default', {}, function(obj) {
  return obj.defaults ? 1 : 0;
});

module.exports = UserAddressSimple.asImmutable();