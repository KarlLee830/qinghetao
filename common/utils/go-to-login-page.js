/**
 * 跳转到登录页，可携带参数
 * 默认跳转回调用页面
 * 参数通nextjs router对象
 * 具体见：https://nextjs.org/docs/api-reference/next/router#router-object
 */

import LoginHelper from './login-helper';

// export default function goToLoginPage(options) {
//   // 默认跳转路径
//   // const { pathname, search: query, hash } = window.location;
//   // const loginPath = browser.env('weixin') ? getWeiXinLoginPath(pathname) : getH5LoginPath(pathname);
//   Router.push({
//     // pathname: loginPath,
//     // query,
//     // hash,
//     ...options,
//   });
// }

export default LoginHelper.saveAndLogin;
