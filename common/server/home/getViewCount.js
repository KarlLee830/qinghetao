import { getViewCount } from '@discuzqsdk/sdk/dist/api/home/get-view-count';

/** 描述：得到帖子浏览量，调用一次后端对该帖子浏览量加1
 * @param {object} params
 * @returns object
 */
export default async function _getViewCount(opts, ctx = null) {
  const res = await getViewCount({ ...opts, __context: ctx });
  return res;
}
