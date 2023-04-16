// 收入明细筛选类型
export const INCOME_DETAIL_CONSTANTS = {
  REWARD_INCOME: {
    text: '打赏收入',
    code: '31,33',
  },
  LABOR_INCOME: {
    text: '人工收入',
    code: 32,
  },
  REDPACK_INCOME: {
    text: '红包收入',
    code: '102,112,151,152,103,113',
  },
  // REDPACK_RETURN: {
  //   text: '红包退回',
  //   code: 152,
  // },
  CATCH_RETURN: {
    text: '异常退款',
    code: '104,114,124,130,163,154',
  },
  OFFER_REWARD_INCOME: {
    text: '悬赏收入',
    code: '120,161,35,121,162',
  },
  // OFFER_REWARD_RETURN: {
  //   text: '悬赏退回',
  //   code: 162,
  // },
  // TODO: 后台需要补充该类型
  PAID_INCOME: {
    text: '付费收入',
    code: '36,60,62,63,64',
  },
  REGISTER_INCOME: {
    text: '注册分成',
    code: 34,
  },
  WITHDRAW_FAIL: {
    text: '提现失败',
    code: 12,
  },
  WEIXIN_CHARGE: {
    text: '自动充值',
    code: 180,
  },
};

// 支出明细筛选类型
export const EXPAND_DETAIL_CONSTANTS = {
  REGISTER_EXPAND: {
    text: '注册支出',
    code: 70,
  },
  UPGRADE_EXPAND: {
    text: '付费升级',
    code: 51,
  },
  LABOR_EXPAND: {
    text: '人工支出',
    code: 50,
  },
  OFFER_REWARD_RETURN: {
    text: '悬赏支出',
    // TODO: 后台需要补充该类型
    code: 160,
  },
  PAID_EXPAND: {
    text: '付费支出',
    code: '61,82,52',
  },
  REDPACK_EXPAND: {
    text: '红包支出',
    code: ' 101,111,150',
  },
  SITE_EXPAND: {
    text: '站点续费',
    code: 71,
  },
  WITHDRAW_EXPAND: {
    text: '提现支出',
    code: 10,
  },
  REWARD_EXPAND: {
    text: '打赏支出',
    code: 41,
  },
  // ORDER_EXPAND: {
  //   text: '合并订单',
  //   code: 170,
  // },
};

// 冻结类型
export const FREEZE_TYPE = {
  OFFER_REWARD: {
    text: '悬赏',
    code: '8,160,165,9,164'
  },
  RED_PACK: {
    text: '红包',
    code: '101,111,150,100,110,153,152,113,103'
  },
  WITHDRAW: {
    text: '提现',
    code: '10,12,11'
  },
  ORDER: {
    text: '合并订单',
    code: '170,171'
  }
}

// 提现明细筛选状态
export const CASH_DETAIL_CONSTANTS = {
  PENDING_REVIEW: {
    text: '待审核',
    code: 1,
  },
  REVIEW_PASSED: {
    text: '审核通过',
    code: 2,
  },
  REVIEW_NOT_PASSED: {
    text: '审核不通过',
    code: 3,
  },
  REMITTANCE: {
    text: '打款中',
    code: 4,
  },
  REMITTANCE_COMPLETED: {
    text: '已打款',
    code: 5,
  },
  REMITTANCE_FAILED: {
    text: '打款失败',
    code: 6,
  },
};

export const PAY_STATUS_MAP = {
  0: '待付款',
  1: '已付款',
  2: '取消订单',
  3: '支付失败',
  4: '订单已过期',
  5: '部分退款',
  10: '全额退款',
  11: '异常订单',
};
