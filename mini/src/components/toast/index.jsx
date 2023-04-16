import React from 'react';
import ToastRef from '@discuzqsdk/design/dist/components/toast/index';
import goToLoginPage from '@common/utils/go-to-login-page';
import { getLaunchOptionsSync } from '@tarojs/taro'

const launchOptionInfo = getLaunchOptionsSync();
const noop = () => {
  // 主动设置跳转，触发单页模式自带的toast提示
  goToLoginPage({ url: '/userPages/user/wx-auth/index' });
};
if (launchOptionInfo?.scene === 1154) {
  ToastRef.info = noop;
  ToastRef.success = noop;
  ToastRef.warning = noop;
  ToastRef.error = noop;
  ToastRef.loading = noop;
}

export default ToastRef;
