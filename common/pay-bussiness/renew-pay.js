import PayBox from '@components/payBox';

export default ({ sitePrice, siteName, userStore, siteStore }) => {
  // const { amount, threadId, payeeId } = payData;

  // if (!amount || !threadId || !payeeId) {
  //   return Promise.resolve({ success: false, data: '参数错误' });
  // }

  return new Promise((resolve, reject) => {
    PayBox.createPayBox({
      data: {
        amount: sitePrice,
        title: siteName,
        type: 8,
      },
      isAnonymous: false, // 是否匿名
      success: async (orderInfo) => {
        await userStore.updateUserInfo(userStore.id);
        await siteStore.getSiteInfo();
        resolve(orderInfo);
      },
      failed: async (orderInfo) => {
        reject(orderInfo);
      },
    });
  }).catch((e) => {
    console.error(e);
  });
};
