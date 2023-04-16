import {h5WechatCodeLogin} from '@discuzqsdk/sdk/dist/api/login/h5-wechat-code-login';
export default async function _h5WechatCodeLogin(opts, ctx) {
  // 不需要设置登录态
  const res = await h5WechatCodeLogin({ ...opts, __context: ctx, _noSetAuthorization: true });
  return res;
}
