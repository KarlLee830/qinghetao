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
export default (payData) => {
  const { amount, isAnonymous, threadId, payeeId, title } = payData;

  if (!amount || !threadId || !payeeId) {
    return Promise.resolve({ success: false, data: '参数错误' });
  }

  const data = {
    amount,
    isAnonymous,
    type: 2,
    threadId,
    payeeId,
    redAmount: 0,
    rewardAmount: 0,
    title,
  };

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
  }).catch((e) => {console.log(e)});
};
