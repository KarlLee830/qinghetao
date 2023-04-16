import { deleteFollow } from '@discuzqsdk/sdk/dist/api/search/delete-follow';

/** 删除我的关注/我的粉丝
 * @param {object} params
 * @returns object
 */
export default async function _deleteFollow(opts, ctx = null) {
  const res = await deleteFollow({ ...opts, __context: ctx });
  return res;
}