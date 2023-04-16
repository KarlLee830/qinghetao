import { readUsersList } from '@discuzqsdk/sdk/dist/api/search/read-users-list';

/** 成员列表
 * @param {object} params
 * @returns object
 */
export default async function _readUsersList(opts, ctx = null) {
  const res = await readUsersList({ ...opts, __context: ctx });
  return res;
}