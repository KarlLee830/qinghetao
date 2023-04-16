import Router from '@discuzqsdk/sdk/dist/router';
import {
  WEB_SITE_JOIN_WHITE_LIST,
  MINI_SITE_JOIN_WHITE_LIST
} from '@common/constants/site';

// 记录用户访问的初始地址，用户登陆、付费等操作后跳回
const JUMP_URL_LABEL = '__jump_url';
const HOME_PAGE_PC = '/';
const HOME_PAGE_MINI = '/pages/index/index';

// web环境判断
function isWeb() {
  return process.env.DISCUZ_ENV === 'web';
}

// sessionStorage是否可用
function isSessionStorage() {
  return typeof window !== 'undefined' && window.sessionStorage;
}

// 跳转地址校验(不合法地址，以及不需要跳转的地址在此处理)
function validateUrl(url) {
  if (typeof url !== 'string') {
    console.error('LoginHelper Error: the url is not a string', url);
    return false;
  }

  if (isWeb()) {
    // 相对地址转绝对地址
    let absUrl = url;
    try {
      if (url.startsWith('/')) {
        absUrl = `${window.location.origin}${url}`;
      }

      const { pathname } = new URL(absUrl);
      // 我的 页面在白名单，需要记录
      if (pathname.startsWith('/my')) {
        return true;
      }

      return !WEB_SITE_JOIN_WHITE_LIST.some(item => pathname.startsWith(item));
    } catch (err) {
      console.error('LoginHelper is setting a invalid url', url, absUrl, err);
      return false;
    }
  } else {
    const miniUrl = url.startsWith('/') ? url : `/${url}`;

    // 我的 页面在白名单，需要记录
    if (miniUrl.startsWith('/userPages/my/index')) {
      return true;
    }
    return !MINI_SITE_JOIN_WHITE_LIST.some(item => miniUrl.startsWith(item));
  }
}

// 获取当前的url
function getCurrentUrl() {
  let url = '';

  if (isWeb()) {
    url = window.location.href;
  } else {
    // 小程序
    const pages = getCurrentPages();
    const { route, options } = pages[pages.length - 1];

    url = route;
    if (Object.keys(options).length > 0) {
      url = `${route}?${Object.entries(options).map(([key, value]) => `${key}=${value}`).join('&')}`;
    }
  }

  return url;
}

// 跳转登录页

class LoginHelper {
  // 跳转地址
  constructor() {
    this.url = '';
  }

  // 记录地址
  setUrl = (url) => {
    if (!validateUrl(url)) {
      return false;
    }

    // 区分web记录地址
    if (isWeb() && isSessionStorage()) {
      window.sessionStorage.setItem(JUMP_URL_LABEL, url);
    } else {
      this.url = url;
    }

    return true;
  };

  // 读取地址
  getUrl = () => {
    let url = '';

    if (isWeb()) {
      url = isSessionStorage() ? window.sessionStorage.getItem(JUMP_URL_LABEL) : this.url;
    } else if (this.url) {
      url = `${this.url.startsWith('/') ? '' : '/'}${this.url}`;
    }

    return url;
  };

  // 清理地址
  clear = () => {
    if (isWeb() && isSessionStorage()) {
      window.sessionStorage.removeItem(JUMP_URL_LABEL);
    } else {
      this.url = '';
    }
  };

  gotoLogin = () => {
    const url = isWeb() ? '/user/login' : '/userPages/user/wx-auth/index';
    Router.redirect({ url });
  };

  // 保存当前地址
  saveCurrentUrl = () => {
    const url = getCurrentUrl();

    this.setUrl(url);
  };

  // 保存当前地址，并跳转目标地址targetUrl
  saveAndRedirect = (targetUrl) => {
    this.saveCurrentUrl();
    Router.redirect({
      url: targetUrl,
    });
  };

  // 保存当前地址，并跳转目标地址targetUrl（非重定向保留原有路由）
  saveAndPush = (targetUrl) => {
    this.saveCurrentUrl();
    Router.push({
      url: targetUrl,
    });
  };

  // 自动记录当前的地址，再跳转登录页
  saveAndLogin = () => {
    this.saveCurrentUrl();

    this.gotoLogin();
  };

  // 指定登陆后跳转到redirectUrl页面(默认清空当前的记录的跳转地址)
  setAndLogin = (redirectUrl) => {
    this.setUrl(redirectUrl);

    this.gotoLogin();
  };

  // 恢复登录前的跳转。优先级：记录页 > 主页
  restore = (clearUrl = true) => {
    const url = this.getUrl() || (isWeb() ? HOME_PAGE_PC : HOME_PAGE_MINI);
    clearUrl && this.clear();

    Router.redirect({
      url,
      fail: () => {
        this.gotoIndex();
      }
   });
  };

  // 清空跳转，进入首页
  gotoIndex = () => {
    this.clear();

    if (isWeb()) {
      // ssr下必须使用location.replace重置跳转，否则登陆态异常
      window.location.replace(HOME_PAGE_PC);
    } else {
      Router.redirect({
        url: HOME_PAGE_MINI,
      });
    }
  }
}

export default new LoginHelper();
