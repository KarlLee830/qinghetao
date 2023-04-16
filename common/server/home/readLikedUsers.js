import { readLikedUsers } from '@discuzqsdk/sdk/dist/api/home/read-liked-users';

/** 获取点赞、打赏用户列表
 * @param {object} params
 * @returns object
 */
export default async function _readLikedUsers(opts, ctx = null) {
  const res = await readLikedUsers({ ...opts, __context: ctx });
  return res;
}
