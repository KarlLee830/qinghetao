import {miniQrcodeLogin} from '@discuzqsdk/sdk/dist/api/login/mini-qrcode-login';
export default async function _miniQrcodeLogin(opts, ctx) {
  const res = await miniQrcodeLogin({ ...opts, __context: ctx });
  return res;
}
