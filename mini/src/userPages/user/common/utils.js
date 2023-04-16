import Taro from '@tarojs/taro';

/**
 * 获取登录信息
 * @returns 登录信息
 */
export const getParamCode = (commonLogin) =>
  new Promise((resolve, reject) => {
    Taro.login({
      success: (res) => {
        if (res.errMsg === 'login:ok') {
          commonLogin.setJsCode(res.code);
          return resolve(res);
        }
        return reject(res);
      },
      fail: (err) => {
        return reject(err);
      },
    });
  });

/**
 * 获取用户信息
 * @returns 用户信息
 */
export const getUserProfile = (callback, isShowLoading = true, fail = () => {}) =>
  new Promise((resolve, reject) => {
    // pc端微信访问小程序，getUserProfile目前接口不可用 20210705
    const getUserInfo = typeof wx.getUserProfile !== 'undefined' ? Taro.getUserProfile : Taro.getUserInfo;
    getUserInfo({
      desc: '账号绑定微信',
      lang: 'zh_CN',
      success: async (res) => {
        if (isShowLoading) {
          Taro.showLoading({ title: '微信登录中', mask: true });
        }

        try {
          if (res.errMsg === 'getUserProfile:ok' || res.errMsg === 'getUserInfo:ok') {
            await callback(res);
            resolve(res);
          } else {
            fail(res);
            throw '微信登录拉起异常: taro.getUserProfile failed';
          }
        } catch (err) {
          fail(err);
          reject(res);
          console.error(err);
        }

        Taro.hideLoading();
      },
      fail: (res) => {
        console.log('res', res);
        fail(res);
      },
    });
  });
