const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  uid: { type: 'Number', required: true },
  name: { type: 'String', required: true },
  avatar: { type: 'ObjectId', ref: 'resource' },
  introduction: { type: 'String', default: '' },
  birthday: { type: 'Date' },
  addresses: [{
    city: { type: 'ObjectId', required: true, ref: 'shop_city' },
    name: { type: 'String', required: true },
    address: { type: 'String', required: true },
    telephone: { type: 'String', required: true },
    postcode: { type: 'Number' },
    defaults: { type: 'Boolean', required: true, default: false }
  }],
  socials: {
    wechat: {
      unionId: { type: 'String' },
      nickname: { type: 'String' },
      status: { type: 'Number' }
    }
  }
})

const userModel = mongoose.model('user', userSchema)
module.exports = userModel