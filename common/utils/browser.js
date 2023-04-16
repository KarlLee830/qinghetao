import isServer from './is-server';
export const constants = {
  IE: 'ie',
  OPERA: 'opera',
  WEBKIT: 'webKit',
  GECKO: 'gecko',
  MOBILE: 'mobile',
  IOS: 'ios',
  ANDROID: 'android',
  IPHONE: 'iPhone',
  IPAD: 'iPad',
  WEBAPP: 'webApp',
  WEIXIN: 'weixin',
  QQ: 'qq',
  UC: 'uc',
  SAFARI: 'safari',
};

const browser = {
  env: (t, u = null) => {
    if (isServer()) {
      return false;
    }
    const ua = u || navigator ? navigator.userAgent : '';
    switch (t) {
      case constants.IE : return ua.indexOf('Trident') > -1;// IE内核
      case constants.OPERA : return ua.indexOf('Presto') > -1;// opera内核
      case constants.WEBKIT : return ua.indexOf('AppleWebKit') > -1;// 苹果、谷歌内核
      case constants.GECKO : return ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') == -1;// 火狐内核
      case constants.MOBILE : return !!ua.match(/AppleWebKit.*Mobile.*/);// 是否为移动终端
      case constants.IOS : return !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // ios终端
      case constants.ANDROID : return ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1; // android终端
      case constants.IPHONE : return ua.indexOf('iPhone') > -1; // 是否为iPhone或者QQHD浏览器
      case constants.IPAD : return ua.indexOf('iPad') > -1; // 是否iPad
      case constants.WEBAPP : return ua.indexOf('Safari') == -1; // 是否web应该程序，没有头部与底部
      case constants.WEIXIN : return ua.indexOf('MicroMessenger') > -1; // 是否微信
      case constants.QQ : return ua.match(/\sQQ/i) == ' qq'; // 是否QQ
      case constants.UC: return ua.indexOf('UCBrowser') > -1; // uc浏览器
      case constants.SAFARI: return /Safari/.test(ua) && !/Chrome/.test(ua); // 是否为 safari 浏览器
      default: return false;
    }
  },
};

export default browser;
