import { THREAD_TYPE, ACCEPT_VIDEO_TYPES, ATTACHMENT_TYPE } from '@common/constants/thread-post';
import { IMG_SRC_HOST } from '@common/constants/site';

// 商品链接分析页的图标
export const goodImages = [
  {
    src: '/dzq-img/jingdong.svg',
    name: '京东',
    width: 20,
    height: 20,
  },
  {
    src: '/dzq-img/taobao.svg',
    name: '淘宝',
    width: 20,
    height: 20,
  },
  {
    src: '/dzq-img/tmall.svg',
    name: '天猫',
    width: 20,
    height: 20,
  },
  {
    src: '/dzq-img/pinduoduo.svg',
    name: '拼多多',
    width: 20,
    height: 20,
  },
  {
    src: '/dzq-img/youzan.svg',
    name: '有赞',
    width: 20,
    height: 20,
  },
];

export const defaultOperation = {
  emoji: 'emoji',
  at: 'at',
  topic: 'topic',
  attach: 'attach',
  redpacket: 'redpacket',
  pay: 'pay',
};

const activeColor = '#2469f6';

/**
 * 默认的操作栏 icon
 */
export const defaultIcon = [
  {
    name: 'SmilingFaceOutlined', // emoji
    // active: activeColor, // 这3个图标永远不需要上颜色
    id: defaultOperation.emoji,
    type: THREAD_TYPE.emoji,
  },
  {
    name: 'AtOutlined', // @
    // active: activeColor,
    id: defaultOperation.at,
    type: THREAD_TYPE.at,
  },
  {
    name: 'SharpOutlined', // #
    // active: activeColor,
    id: defaultOperation.topic,
    type: THREAD_TYPE.topic,
  },
  {
    name: 'PaperClipOutlined', // 附件
    active: activeColor,
    id: defaultOperation.attach,
    type: THREAD_TYPE.file,
  },
  {
    name: 'RedPacketOutlined', // 红包
    active: activeColor,
    id: defaultOperation.redpacket,
    type: THREAD_TYPE.redPacket,
  },
  {
    name: 'GoldCoinOutlined', // 付费
    active: activeColor,
    id: defaultOperation.pay,
    menu: [
      {
        id: 'threadpay',
        name: '全帖付费',
      },
      {
        id: 'attachpay',
        name: '部分付费',
      },
    ],
    type: THREAD_TYPE.paid,
  },
];

export const attachIcon = [
  {
    name: 'PictureOutlinedBig',
    active: activeColor,
    type: THREAD_TYPE.image,
  },
  {
    name: 'VideoOutlined',
    active: activeColor,
    type: THREAD_TYPE.video,
    isUpload: false,
    limit: 1,
    accept: ACCEPT_VIDEO_TYPES.join(','),
    data: {
      type: ATTACHMENT_TYPE.video,
    },
  },
  {
    name: 'MicroOutlined',
    active: activeColor,
    type: THREAD_TYPE.voice,
  },
  // {
  //   name: 'ShoppingCartOutlined',
  //   active: activeColor,
  //   type: THREAD_TYPE.goods,
  // },
  {
    name: 'QuestionOutlined',
    active: activeColor,
    type: THREAD_TYPE.reward,
  },
  {
    name: 'VoteOutlined',
    active: activeColor,
    type: THREAD_TYPE.vote,
  },
  {
    name: 'AnonymityOutlined',
    active: activeColor,
    type: THREAD_TYPE.anonymity,
  },
];

// 发帖底部付费选项
export const paidOption = [
  {
    name: '全帖付费',
    type: THREAD_TYPE.paidPost,
  },
  {
    name: '部分付费',
    type: THREAD_TYPE.paidAttachment,
  },
];

// 发帖底部草稿选项
export const draftOption = [
  {
    name: '保存草稿',
    type: THREAD_TYPE.saveDraft,
  },
  {
    name: '不保存',
    type: THREAD_TYPE.abandonDraft,
  },
];

// 付费用户组的主题样式
export const payGroupLevelStyle = {
  0: {
    bgImg: `${IMG_SRC_HOST}/assets/ship-card-pc.e7c12e08843409af87f3898e25ef67d1d4334339.png`,
  },
  1: {
    bgImg: `${IMG_SRC_HOST}/assets/2.3ecfa6ceb2c739701572aa9d3e8084a7a626e94c.png`,
    groupNameColor: '#393b42',
    desAndDateColor: '#8e8f94',
    leftBtnTextColor: '#efefef',
    rightBtnBgColor: 'rgba(57, 59, 66, 0.1)',
    otherColor: '#797a7d',
  },
  2: {
    bgImg: `${IMG_SRC_HOST}/assets/1.517f7a52bc5ae1f4b5695dc80f02e79211e27290.png`,
    groupNameColor: '#2f1801',
    desAndDateColor: '#6c562d',
    leftBtnTextColor: '#f7ecc7',
    rightBtnBgColor: 'rgba(47, 24, 1, 0.1)',
    otherColor: '#624a1e',
  },
  3: {
    bgImg: `${IMG_SRC_HOST}/assets/3.d7570bef4fd539e135081a017028cef85ee6df74.png`,
    groupNameColor: '#3a3d63',
    desAndDateColor: '#505279',
    leftBtnTextColor: '#c8cde8',
    rightBtnBgColor: 'rgba(58, 61, 99, 0.1)',
    otherColor: '#474b7a',
  },
  4: {
    bgImg: `${IMG_SRC_HOST}/assets/4.2804d984fa9756208062e6115dfa0461653daf8d.png`,
    groupNameColor: '#fdf2f0',
    desAndDateColor: '#f3e2dc',
    leftBtnTextColor: '#683b41',
    rightBtnBgColor: 'rgba(245, 225, 220, 0.1)',
    otherColor: '#f5e1dc',
  },
  5: {
    bgImg: `${IMG_SRC_HOST}/assets/5.e1f86ee2189404ab35e45922fbc79c360d395386.png`,
    groupNameColor: '#f4d0b1',
    desAndDateColor: '#ceb6b2',
    leftBtnTextColor: '#14131d',
    rightBtnBgColor: 'rgba(244, 208, 177, 0.1)',
    otherColor: '#f4d0b1',
  },
};
