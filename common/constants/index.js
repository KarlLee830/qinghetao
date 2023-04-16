export default {
    "ACCESS_TOKEN_NAME": "access_token"
}

// 多类型筛选
export const THREAD_LIST_FILTER_COMPLEX = {
  nouse: 0, // 不使用
  draft: 1, // 草稿
  like: 2, // 点赞
  collect: 3, // 收藏
  pay: 4, // 购买
  topic: 5, // 我的|他人主题
};

// 默认排序规则
export const THREAD_LIST_SEQUENCE = {
  nomarl: 0, // 正常列表
  smartSort: 1, // 智能排序
};

// 首页附件折叠参数
export const ATTACHMENT_FOLD_COUNT = 6;
