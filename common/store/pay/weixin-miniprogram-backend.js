import { PAY_BOX_ERROR_CODE_MAP, PAY_MENT_MAP } from '../../constants/payBoxStoreConstants';
import Taro from '@tarojs/taro';

export const onBridgeReady = data => new Promise((resolve, reject) => {
  const { appId, timeStamp, nonceStr, package: wxPackage, paySign } = data;
  // eslint-disable-next-line no-undef
  Taro.requestPayment({
    appId,
    nonceStr,
    package: wxPackage,
    paySign,
    timeStamp,
    signType: 'MD5',
    success: (result) => {
      resolve(result);
    },
    fail: (error) => {
      reject({
        ...PAY_BOX_ERROR_CODE_MAP.WX_MINI_PAY_CREATE_FAILED,
        error,
      });
    },
  });
}).catch((e) => {console.log(e)});

export const listenWXJsBridgeAndExecCallback = (callback) => {
  callback();
};

export const wxValidator = () => {
  const systemInfo = Taro.getSystemInfoSync();
  const { system } = systemInfo;
  if (/iOS/.test(system)) {
    throw PAY_BOX_ERROR_CODE_MAP.IN_IOS;
  }
};

export const mode = PAY_MENT_MAP.WX_MINI_PROGRAM;
