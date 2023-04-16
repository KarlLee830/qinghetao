import Taro from '@tarojs/taro';

/**
 * 微信小程序专用-打开另一个小程序
 * @param {string} qcloudCaptchaAppId 您申请的验证码的 appId
 */
export const toTCaptcha = qcloudCaptchaAppId => Taro.navigateToMiniProgram({
  appId: 'wx5a3a7366fd07e119',
  path: '/pages/captcha/index',
  envVersion: 'release',
  extraData: {
    appId: qcloudCaptchaAppId,
  },
  success(res) { // 验证码成功打开
    return res;
  },
  fail(err) { // 失败
    return err;
  },
});
