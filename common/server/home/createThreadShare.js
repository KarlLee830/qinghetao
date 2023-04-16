import { createThreadShare } from '@discuzqsdk/sdk/dist/api/home/create-thread-share';

/** 创建帖子分享
 * @param {object} params
 * @returns object
 */
export default async function _createThreadShare(opts, ctx = null) {
  const res = await createThreadShare({ ...opts, __context: ctx });
  return res;
}
