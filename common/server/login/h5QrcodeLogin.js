import {h5QrcodeLogin} from '@discuzqsdk/sdk/dist/api/login/h5-qrcode-login';
export default async function _h5QrcodeLogin(opts, ctx) {
  const res = await h5QrcodeLogin({ ...opts, __context: ctx });
  return res;
}
