const Sequelize = require('sequelize')

const AccountSchema = {
  uid: {
    type: Sequelize.INTEGER,
    field: 'uid',
    primaryKey: true
  },
  username: {
    type: Sequelize.STRING,
    field: 'username'
  },
  nickname: {
    type: Sequelize.STRING,
    field: 'nickname'
  },
  email: {
    type: Sequelize.STRING,
    field: 'email'
  },
  password: {
    type: Sequelize.STRING,
    field: 'password'
  },
  phone: {
    type: Sequelize.STRING,
    field: 'phone'
  },
  mobile: {
    type: Sequelize.STRING,
    field: 'mobile'
  },
  realname: {
    type: Sequelize.STRING,
    field: 'realname'
  },

  // 用户等级
  grade: {
    type: Sequelize.STRING,
    field: 'grade'
  },

  // 论坛积分
  forumPoints: {
    type: Sequelize.INTEGER,
    field: 'extcredits1'
  },

  // 账户余额
  balance: {
    type: Sequelize.DECIMAL(10, 2),
    field: 'balance'
  },

  // 啵币
  bqCoin: {
    type: Sequelize.INTEGER,
    field: 'extcredits2'
  },
  // 波奇豆
  bean: {
    type: Sequelize.INTEGER,
    field: 'bean'
  },

  // 第三方账号
  socialUnionId: {
    type: Sequelize.STRING,
    field: 'froms_uids'
  },

  socialComs: {
    type: Sequelize.STRING,
    field: 'froms_coms'
  },

  // 记录相关
  registeredIp: {
    type: Sequelize.STRING,
    field: 'regip'
  },
  registeredTime: {
    type: Sequelize.INTEGER,
    field: 'regdate'
  },
  latestVisitIp: {
    type: Sequelize.STRING,
    field: 'lastip'
  },
  latestVisitTime: {
    type: Sequelize.INTEGER,
    field: 'lastvisit'
  },
  loginCount: {
    type: Sequelize.INTEGER,
    field: 'logins'
  },
  generated: {
    type: Sequelize.INTEGER,
    field: 'is_system'
  },

  // 0为PC, 1为iOS, 2为Android, 3为H5
  platform: {
    type: Sequelize.INTEGER,
    field: 'platform'
  }
};

module.exports = sequelize.define('Account', AccountSchema);