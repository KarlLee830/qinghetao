const typeHeight = {
  header: 70, // 头部
  title: 22 + 16, // 标题
  images: {
    // 图片
    1: 16 + 260,
    2: 16 + 260,
    3: 16 + 256,
    4: 16 + 260,
    5: 16 + 241,
  },
  goods: 16 + 114, // 商品
  redPacket: 16 + 193, // 红包
  reward: 16 + 193, // 悬赏
  video: 16 + 193, // 视频
  audio: 16 + 56, // 音频
  file: 52 + 8, // 附件
  fileMarginTop: 16,
  shareLike: 16 + 24 + 8, // 分享点赞
  footer: 16 + 52, // 底部
  footerMarginTop: 16,
  payButton: 16 + 36,
};

// 获取不可变的类型高度
export const getImmutableTypeHeight = (data) => {
  let height = 0;

  if (!data) return height;

  const needPay = data.payType !== 0 && !data.paid;

  height = height + typeHeight.header;
  height = height + typeHeight.footer;

  // 标题
  if (data.title) {
    height = height + typeHeight.title;
  }

  // 分享点赞
  if (data.likeReward?.postCount || data.likeReward?.shareCount || data.likeReward?.likePayCount) {
    height = height + typeHeight.shareLike - typeHeight.footerMarginTop;
  }

  if (needPay) {
    height = height + typeHeight.payButton;
  }

  const content = data.content;

  const values = Object.values(content?.indexes || {});
  values.forEach((item) => {
    const { tomId } = item;
    // 统一做一次字符串转换
    const conversionTomID = `${tomId}`;
    if (conversionTomID === '101' && item.body?.length) {
      // 图片
      const imgNum = item.body?.length;
      height = height + typeHeight.images[imgNum > 5 ? 5 : imgNum];
    } else if (conversionTomID === '102' && item.body) {
      // 音频
      height = height + typeHeight.audio;
    } else if (conversionTomID === '103' && item.body) {
      // 视频
      height = height + typeHeight.video;
    } else if (conversionTomID === '104' && item.body) {
      // 商品
      height = height + typeHeight.goods;
    } else if (conversionTomID === '105' && item.body?.length) {
      // 问答
      // height = height + typeHeight.reward;
    } else if (conversionTomID === '106' && item.body) {
      // 红包
      height = height + typeHeight.redPacket;
    } else if (conversionTomID === '107' && item.body) {
      // 悬赏
      height = height + typeHeight.reward;
    } else if (conversionTomID === '108' && item.body?.length) {
      // 附件
      height = height + typeHeight.fileMarginTop + typeHeight.file * item.body.length;
    }
  });
  return height;
};

export const getSticksHeight = (list, platform = 'h5') => {
  let height = (list?.length || 0) * 37;
  height = height ? height + 10 : 0;

  if (platform === 'pc') {
    height = (list?.length || 0) * 38;
    height = height ? 8 + height + 8 : 0;
  }

  return height;
};

export const getTabsHeight = (platform = 'h5') => {
  return platform === 'h5' ? 54 + 10 : 68;
};

export const getLogHeight = (platform = 'h5') => {
  return platform === 'h5' ? 165 : 10;
};
