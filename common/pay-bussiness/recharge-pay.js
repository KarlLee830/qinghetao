import PayBox from '@components/payBox';

export default (payData) => {
  const { amount, title } = payData;

  return new Promise((resolve, reject) => {
    PayBox.createPayBox({
      data: {
        amount,
        title,
        type: 30,
      },
      success: (orderInfo) => {
        resolve({ success: true, data: orderInfo });
      },
      failed: (orderInfo) => {
        resolve({ success: false, data: orderInfo });
      },
    });
  }).catch((e) => {
    console.error(e);
  });
};
