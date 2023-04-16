import { PAY_BOX_ERROR_CODE_MAP, PAY_MENT_MAP, WX_PAY_STATUS } from '../../constants/payBoxStoreConstants';
import { get } from '../../utils/get';
import browser from '@common/utils/browser';
import Router from '@discuzqsdk/sdk/dist/router';

export const onBridgeReady = data => new Promise((resolve, reject) => {
  const { appId, timeStamp, nonceStr, package: wxPackage, paySign } = data;
  // eslint-disable-next-line no-undef
  WeixinJSBridge.invoke('getBrandWCPayRequest', {
    appId,
    timeStamp,
    nonceStr,
    package: wxPackage,
    signType: 'MD5',
    paySign,
  }, (data) => {
    const payStatus = get(data, 'err_msg', '');
    if (payStatus === WX_PAY_STATUS.WX_PAY_OK) {
      resolve();
    }

    if (payStatus === WX_PAY_STATUS.WX_PAY_CANCEL) {
      reject(PAY_BOX_ERROR_CODE_MAP.WX_PAY_CANCEL);
    }

    if (payStatus === WX_PAY_STATUS.WX_PAY_FAIL) {
      reject(PAY_BOX_ERROR_CODE_MAP.WX_PAY_FAIL);
    }
  });
}).catch((e) => {
  console.log(e);
});

export const onBridgeReadyH5 = data => new Promise((resolve, reject) => {
  const link = `/pay/middle?link=${encodeURIComponent(data)}`;

  Router.push({ url: link });

  resolve();
});

export const listenWXJsBridgeAndExecCallback = (callback) => {
  if (typeof WeixinJSBridge === 'undefined') {
    if (document.addEventListener) {
      document.addEventListener('WeixinJSBridgeReady', callback, false);
    } else if (document.attachEvent) {
      document.attachEvent('WeixinJSBridgeReady', callback);
      document.attachEvent('onWeixinJSBridgeReady', callback);
    }
  } else {
    callback();
  }
};

export const listenWXJsBridgeAndExecCallbackH5 = (callback) => {
  callback();
};

export const wxValidator = () => {
  // #ifdef H5
  // if (!isWeixin()) {
  //   // is not in weixin, just throw tips error
  //   throw PAY_BOX_ERROR_CODE_MAP.NOT_IN_WEIXIN_PAY;
  // }

  // IOS 暂时政策不允许支付
  // if (browser.env('ios')) {
  //   throw PAY_BOX_ERROR_CODE_MAP.IN_IOS;
  // }
  // #endif
};

export const mode = PAY_MENT_MAP.WX_OFFICAL;
