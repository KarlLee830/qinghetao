import { readRecommends } from '@discuzqsdk/sdk/dist/api/home/read-recommends';

/** 推荐列表
 * @param {object} params
 * @returns object
 */
export default async function _readRecommends(opts, ctx = null) {
  const res = await readRecommends({ ...opts, __context: ctx });
  return res;
}