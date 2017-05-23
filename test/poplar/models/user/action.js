const mongoose = require('mongoose')

var ActionSchema = new mongoose.Schema({
  title: { type: 'String', default: '' },
  subTitle: { type: 'String', default: '' },
  channel: { type: 'String', required: true, enum: [1, 2, 3] }, // 频道
  clientChannelNames: [ {type: 'String'} ], // 客户端(安卓)渠道
  actionType: { type: 'String', required: true, default: 'NONE', enum: [4, 5, 6] }, // 跳转类型
  // 跳转值, 包含, android, ios, web 三中类型, 最终需要解析成 ?a=1&b=2 格式返回给前端
  actionValues: {
    android: [{ key: { type: 'String' }, value: { type: 'String' } }],
    ios: [{ key: { type: 'String' }, value: { type: 'String' } }],
    web: [{ key: { type: 'String' }, value: { type: 'String' } }]
  },
  category: { type: 'String', required: true, enum: [7, 8, 9] },
  itemsCount: { type: 'Number', default: 0 }, // 条目数
  image: { type: 'ObjectId', ref: 'resource' },
  validStart: { type: 'Date' },
  validEnd: { type: 'Date' },
  frequencyLimit: { type: 'Number', default: -1 }, // 展示频率
  enabled: { type: 'Boolean', default: true }
});

ActionSchema.index({ category: 1 });


const ActionModel = mongoose.model('action', ActionSchema)
module.exports = ActionModel