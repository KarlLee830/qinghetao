import { getMiniCode } from '@discuzqsdk/sdk/dist/api/home/get-mini-code';

/** 生成小程序二维码接口用于分享
 * @param {object} params
 * @returns object
 */
export default async function _getMiniCode(opts, ctx = null) {
  const res = await getMiniCode({ ...opts, __context: ctx });
  return res;
}