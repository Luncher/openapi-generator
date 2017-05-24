const mongoose = require('mongoose')

var ActionSchema = new mongoose.Schema({
  code: { type: 'String', required: true },
  uid: { type: 'String', required: true },
  user: { type: 'ObjectId', ref: 'user', required: true },
  status: { type: 'Number', default: 0 },
  statusServer: { type: 'Number', default: 0 },
  items: [{
    item: { type: 'ObjectId', ref: 'shop_item', required: true },
    price: { type: 'Number', default: 0 }, // 固化 item..providers.price
    cost: { type: 'Number', default: 0 }, // 固化 item.stock.providers.cost
    packageCost: { type: 'Number', default: 0 },  // deprecated
    number: { type: 'Number', default: 0 },
    materials: [{
      material: {type: 'ObjectId', required: true, ref: 'shop_material'}, // 固化 item.stock.materials.material
      number: { type: 'Number', default: 0, required: true }, // 固化 物料个数
      unitPrice: { type: 'Number', default: 0, required: true }, // 固化 物料成本单价
    }],
  }],
  coupon: { type: 'ObjectId', ref: 'user_coupon' },
  payments: {
    currency: { type: 'String', enum: ['CNY', 'USD'], default: 'CNY' },
    total: { type: 'Number', default: 0 },
    payment: { type: 'Number', default: 0 },
    discount: { type: 'Number', default: 0 },
    delivery: { type: 'Number', default: 0 },
    adjustment: { type: 'Number', default: 0 },
    method: { type: 'String', enum: ['wechat', 'alipay'] },
    tradeNo: { type: 'String' }, // out_trade_no 商户支付号
    paidAt: { type: 'Date' },
    payMessage: { type: 'Mixed' }, // 发给支付网关的支付数据
    tradeData: { type: 'Mixed' } // 从支付网关接受的支付数据
  },
  delivery: {
    provider: { type: 'ObjectId', ref: 'shop_provider' },
    delivery: { type: 'ObjectId', ref: 'shop_delivery' },
    code: { type: 'String' }, // 全国配送物流单号
    price: { type: 'Number', default: 0 }, // 固化 delivery.city.price
    cost: { type: 'Number', default: 0 }, // 固化 delivery.city.cost 
    shopCost: { type: 'Number', default: 0 }, // 花店配送费用(用于费用结算)
    deliveryTime: { type: 'Date' }, // 预约时间
    deliveredAt: { type: 'Date' }, // 配送时间
    address: { type: 'ObjectId', required: true },
    addressDelivery: {
      city: { type: 'ObjectId', ref: 'shop_city' },
      name: { type: 'String' },
      address: { type: 'String' },
      fullAddress: { type: 'String' },
      telephone: { type: 'String' },
      postcode: { type: 'String' }
    },
    addressChanged: {
      city: { type: 'ObjectId', ref: 'shop_city' },
      name: { type: 'String' },
      address: { type: 'String' },
      fullAddress: { type: 'String' },
      telephone: { type: 'String' },
      postcode: { type: 'String' }
    },
    certImages: [
      { type: 'ObjectId', ref: 'resource' } //配送凭证图片
    ],
    events: [{//物流信息
      eventTime: { type: 'String' },
      eventDesc: { type: 'String' },
    }]
  },
  card: {
    isNeeded: { type: 'Boolean', default: false }, // 是否需要电子贺卡
    message: { type: 'String' },  // 贺卡内容
    signature: { type: 'String' }, // 贺卡署名
    readAt: { type: 'Date' }, // 电子贺卡已读
  },
  serviceExtras: {
    message: { type: 'String' },      // 用户订单留言
    serviceNote: { type: 'String' },  // 客服备注
    cancelReason: { type: 'String' }, // 订单取消备注
    problemNote: { type: 'String' },  // 问题单备注
    deliveryNote: { type: 'String' }, // 花店同城配送说明
    completeNote: { type: 'String' }, // 完成订单说明/配送备注
    providerReason: { type: 'String' },  // 花店订单取消备注
    providerProblem: { type: 'String' }, // 花店问题单备注
    adjustmentNote: { type: 'String' }, // 金额调整备注
    adjustCostNote: { type: 'String' }  // 花材成本调整备注
  },
  // 物料调整库存
  materialExtras: [{
    material: {type: 'ObjectId', required: true, ref: 'shop_material'},
    number: { type: 'Number', default: 0, required: true },
    unitPrice: { type: 'Number', default: 0, required: true },
  }],
  refund: {
    type: { type: 'Number' },
    amount: { type: 'Number' },
    reason: { type: 'String', enum: ['1', '2', '3'], default: 'ZZ' }, // 退款原因
    note: { type: 'String' } // 退款备注
  },
  testStringArray: [{ type: 'String' }],
  invoice: { type: 'ObjectId', ref: 'shop_invoice' }, // 发票
  settlement: { type: 'ObjectId', ref: 'shop_settlement' }, // 结算
  newbie: { type: 'Boolean', default: false }, // 是否新用户订单
  testFlag: { type: 'Boolean', default: false } // 测试订单标记(true: 测试订单，默认 false)
});

ActionSchema.index({ category: 1 });


const ActionModel = mongoose.model('action', ActionSchema)
module.exports = ActionModel