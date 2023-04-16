import { createFollow } from '@discuzqsdk/sdk/dist/api/search/create-follow';

/** 粉丝关注创建
 * @param {object} params
 * @returns object
 */
export default async function _createFollow(opts, ctx = null) {
  const res = await createFollow({ ...opts, __context: ctx });
  return res;
}
