import loginHelper from './login-helper';
import setUrlParam from './set-url-param';

const WEB_THREAD_PAGE = '/thread/post';
const MINI_THREAD_PAGE = '/indexPages/thread/post/index';
const MINI_BIND_PHONE_PAGE = '/userPages/user/bind-phone/index';
// web环境判断
function isWeb() {
  return process.env.DISCUZ_ENV === 'web';
}
/**
 * 判断是否可以发布内容
 */
export default function canPublish(userStore, siteStore, type, threadId = '') {
  if (!userStore.isLogin()) { // 是否登录
    loginHelper.saveAndLogin();
    return false;
  }
  if (!siteStore.publishNeedBindPhone && !siteStore.publishNeedBindWechat) { // 如果没有开启发帖需要绑定手机或者微信，则不做逻辑处理
    return true;
  }
  if (!isWeb() && siteStore.publishNeedBindPhone && !userStore.mobile) { // 小程序未绑定手机号，不继续处理，直接跳去绑定手机
    loginHelper.saveAndPush(setUrlParam(MINI_BIND_PHONE_PAGE, { limitPublishType: type }));
    type === 'comment' && loginHelper.setUrl(MINI_THREAD_PAGE);
    return false;
  }

  const bindType = `bind${siteStore.publishNeedBindPhone && !userStore.mobile ? 'Mobile' : ''}${siteStore.publishNeedBindWechat && !userStore.isBindWechat ? 'Wechat' : ''}`;
  const mode = `${(siteStore.isSmsOpen && 'mobile') || ''}${(siteStore.wechatEnv !== 'none' && 'wechat') || ''}`;
  let url = '';
  let toPage = '';
  const params = { limitPublishType: type };
  if (siteStore.platform === 'h5' && isWeb()) {
    switch (type) {
      case 'comment':
        if (siteStore.wechatEnv === 'miniProgram') {
          toPage = `${window.location.origin}${MINI_THREAD_PAGE}`;
          break;
        }
        toPage = `${window.location.origin}${WEB_THREAD_PAGE}`;
        break;
      case 'reply':
        if (siteStore.wechatEnv === 'miniProgram') {
          toPage = `/indexPages/thread/index?id=${threadId}`;
          break;
        }
        loginHelper.saveCurrentUrl();
        toPage = loginHelper.getUrl();
        break;
    }
    toPage = encodeURIComponent(toPage);
    toPage && (params.toPage = toPage);
  }

  switch (mode) {
    case 'mobile': // 手机模式
      url = !userStore.mobile ? setUrlParam('/user/bind-phone', params) : '';
      break;
    case 'wechat': // 微信模式
      url = !userStore.isBindWechat ? setUrlParam('/user/wx-bind-qrcode', params) : '';
      break;
    case 'mobilewechat': // 手机 + 微信模式
      switch (bindType) {
        case 'bindMobile': // 需要绑定手机
          url = !userStore.mobile ? setUrlParam('/user/bind-phone', params) : '';
          break;
        case 'bindWechat': // 需要绑定微信
          url = !userStore.isBindWechat ? setUrlParam('/user/wx-bind-qrcode', params) : '';
          break;
        case 'bindMobileWechat': // 需要绑定手机和微信
          params.bindPhone = 1;
          url = !userStore.isBindWechat && !userStore.mobile ? setUrlParam('/user/wx-bind-qrcode', params) : '';
          break;
      }
      break;
  }
  url && loginHelper.saveAndPush(url);
  // 发帖时，web端需要记录跳转页面为编辑器
  if (type === 'comment' && isWeb()) {
    loginHelper.setUrl(`${window.location.origin}${WEB_THREAD_PAGE}`);
  }
  return !url;
}
