import PayBox from '@components/payBox';

/**
 * 订单类型：
 * 1注册(站点付费加入)，
 * 2打赏，
 * 3购买主题，
 * 4购买权限组，
 * 5付费提问，
 * 6问答围观，
 * 7购买附件，
 * 8站点付费(续费)，
 * 9红包，
 * 10悬赏，
 * 11合并订单(红包+悬赏合并支付)
 */

/**
 *
 * amount	float	Y	总支付金额	为合并订单时，amount = redAmount+rewardAmount
 * redAmount	float	N	红包金额
 * rewardAmount	float	N	悬赏金额
 * isAnonymous	int	N	是否匿名购买
 * type	int	Y	订单类型	订单类型：1注册(站点付费加入)，2打赏，3购买主题，4购买权限组，5付费提问，6问答围观，7购买附件，8站点付费(续费)，9红包，10悬赏，11合并订单(红包+悬赏合并支付)
 * threadId	int	N	帖子ID	用户购买付费主题、付费附件、围观付费时，需传
 * groupId	int	N	用户组ID	用户购买用户组
 * payeeId	int	N	收款人ID	帖子的作者
 */
export default (thread, user) => {
  const { threadId, userId, title, group, payType, price, attachmentPrice, paid } = thread;

  // 免费或已付费
  if (payType === 0 || paid === null || paid === true) {
    return Promise.resolve({ success: true });
  }

  const data = {
    threadId,
    payeeId: userId,
    redAmount: 0,
    rewardAmount: 0,
    isAnonymous: 0,
  };

  // 主题付费
  if (payType === 1) {
    data.type = 3;
    data.amount = price;
    data.title = title || '付费主题';
  }

  // 附件部分付费
  if (payType === 2) {
    data.type = 7;
    data.amount = attachmentPrice;
    data.title = title || '部分付费';
  }

  return new Promise((resolve, reject) => {
    PayBox.createPayBox({
      data,
      currentPage: {
        type: 1,
        threadId
      },
      success: (orderInfo) => {
        resolve({ success: true, data: orderInfo });
      },
      failed: (orderInfo) => {
        resolve({ success: false, data: orderInfo });
      },
    });
  }).catch((e) => {
    console.log(e);
  });
};
