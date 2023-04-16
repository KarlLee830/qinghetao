export const STEP_MAP = {
  SURE: 'sure', // 订单确认阶段
  PAYWAY: 'payway', // 选择支付方式阶段
  PAY: 'pay', // 付费阶段
  WALLET_PASSWORD: 'walletPassword', // 钱包密码输入阶段
  RESULT: 'result', // 付费完成后确认付费信息阶段
  SET_PASSWORD: 'setPassword', // 设置支付密码
};

// 支付模式映射表
export const PAYWAY_MAP = {
  WX: 'weixin', // 微信支付
  WALLET: 'wallet', // 钱包支付
};

// 微信支付状态映射表
export const WX_PAY_STATUS = {
  WX_PAY_OK: 'get_brand_wcpay_request:ok',
  WX_PAY_CANCEL: 'get_brand_wcpay_request:cancel',
  WX_PAY_FAIL: 'get_brand_wcpay_request:fail',
};

// 支付方式映射表
export const PAY_MENT_MAP = {
  WX_QRCODE: 10,
  WX_H5: 11,
  WX_OFFICAL: 12,
  WX_MINI_PROGRAM: 13,
  WALLET: 20,
};

// 订单状态映射表
export const ORDER_STATUS_MAP = {
  PENDING_PAY: 0,
  PAID: 1,
  CANCEL_PAY: 2,
  FAIL_PAY: 3,
  OUT_DATE_PAY: 4,
};

// 订单交易类型映射表
export const ORDER_TRADE_TYPE = {
  ORDER_TYPE_REGISTER: 1, // 表示注册(站点付费加入)
  ORDER_TYPE_REWARD: 2, // 表示打赏
  ORDER_TYPE_THREAD: 3, //付费主题
  ORDER_TYPE_GROUP: 4, // 付费用户组
  ORDER_TYPE_QUESTION: 5, // 问答提问支付
  ORDER_TYPE_ONLOOKER: 6, // 问答围观
  ORDER_TYPE_ATTACHMENT: 7, // 附件
  ORDER_TYPE_RENEW: 8, // 站点续费
  ORDER_TYPE_REDPACKET: 9, // 红包
  ORDER_TYPE_QUESTION_REWARD: 10, // 悬赏
  ORDER_TYPE_MERGE: 11, // 合并支付（红包+悬赏） 
  ORDER_TYPE_TEXT: 20, // 文字帖红包
  ORDER_TYPE_RECHARGE: 30, // 充值
}
// export const ORDER_TRADE_TYPE = {
//   REGEISTER_SITE: 1, // 表示注册(站点付费加入)
//   REWARD: 2, // 表示打赏
//   THEME: 3, //购买主题
//   AUTHORITY_GROUP: 4, // 购买权限组
//   PUT_PROBLEM: 5, // 付费提问
//   ATTACHMEMENT: 7, // 附件
//   RED_PACKET: 9, // 红包
//   POST_REWARD: 10, // 悬赏
//   COMBIE_PAYMENT: 11 // 合并支付（红包+悬赏） 
// }

export const PAY_BOX_ERROR_CODE_MAP = {
  NOT_IN_WEIXIN_PAY: {
    Code: 'pbx_0001',
    Message: '微信外浏览器无法拉起付款',
  },
  IN_IOS: {
    Code: 'pbx_0002',
    Message: '由于相关规范，IOS系统且微信内，禁止进行此操作，请更换其它途径操作',
  },
  WX_PAY_CANCEL: {
    Code: 'pbx_0003',
    Message: '微信支付取消',
  },
  WX_PAY_FAIL: {
    Code: 'pbx_0004',
    Message: '微信支付拉起失败',
  },
  NETWORK_ERROR: {
    Code: 'pbx_9999',
    Message: '网络错误',
  },
  WX_MINI_PAY_CREATE_FAILED: {
    Code: 'pbx_0005',
    Message: '拉起微信小程序支付失败',
  }
};
