import {genMiniQrcode} from '@discuzqsdk/sdk/dist/api/login/gen-mini-qrcode';
export default async function _genMiniQrcode(opts, ctx) {
  const res = await genMiniQrcode({ ...opts, __context: ctx });
  return res;
}
