export const initPostData = {
  title: '', // 标题
  categoryId: 0, // 分类id
  anonymous: 0, // 非匿名； 1 - 匿名。如果是 0 的时候不传
  draft: 0, // 非草稿：1 - 草稿。如果是 0 的时候不传
  price: 0, // 帖子价格 - 全帖付费。如果是 0 的时候不传
  attachmentPrice: 0, // 附件价格 - 帖子免费，附件收费。如果是 0 的时候不传
  freeWords: 0, // 百分比 0 - 1 之间；
  position: {}, // 定位信息。longtitude，latitude，address，location
  contentText: '', // 文本内容
  audio: {}, // 语音
  rewardQa: {}, // 悬赏问答 value-价格，times-悬赏结束时间
  product: {}, // 商品
  redpacket: {}, // 红包 rule-规则，price-金额，number-个数，condition-领取条件，likenum-点赞数
  video: {}, // 视频
  vote: {}, // 投票
  images: {}, // 图片
  files: {}, // 文件
  orderSn: '', // 支付订单号
  captchaTicket: '', // 腾讯云验证码返回票据
  captchaRandStr: '', // 腾讯云验证码返回随机字符串
  isDraft: false, // 是否是编辑的草稿
  orderInfo: {}, // 订单信息
  threadId: '', // 文章id
  autoSaveTime: '', // 自动保存时间
  isResetContentText: false, // 是否重置编辑器中的值
  iframe: {}, // 网络插入视频，都是iframe
  // 插件配置
  plugin: {},
};
