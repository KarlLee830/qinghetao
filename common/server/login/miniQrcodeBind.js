import {miniQrcodeBind} from '@discuzqsdk/sdk/dist/api/login/mini-qrcode-bind';
export default async function _miniQrcodeBind(opts, ctx) {
  const res = await miniQrcodeBind({ ...opts, __context: ctx });
  return res;
}
