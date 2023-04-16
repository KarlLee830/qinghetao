import {h5QrcodeBind} from '@discuzqsdk/sdk/dist/api/login/h5-qrcode-bind';
export default async function _h5QrcodeBind(opts, ctx) {
  const res = await h5QrcodeBind({ ...opts, __context: ctx });
  return res;
}
