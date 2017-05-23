const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  uid: { type: 'Number', required: true, description: '用户uid' },
  name: { type: 'String', required: true },
  avatar: { type: 'ObjectId', ref: 'resource', description: '用户头像'  },
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
  },
  statistics: {
    loginCount: { type: 'Number', default: 0 },
    followersCount: { type: 'Number', default: 0 },
    followeesCount: { type: 'Number', default: 0 },
    browseNum: { type: 'Number', default: 0 }, // sync with time_sample
    postCount: { type: 'Number', default: 0 },
    letterCount: { type: 'Number', default: 0 },
    albumCount: { type: 'Number', default: 0 }
  },
})

const userModel = mongoose.model('user', userSchema)
module.exports = userModel