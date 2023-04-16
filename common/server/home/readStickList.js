import { readStickList } from '@discuzqsdk/sdk/dist/api/home/read-stick-list';

/** 置顶列表
 * @param {object} params
 * @returns object
 */
export default async function _readStickList(opts, ctx = null) {
  const res = await readStickList({ ...opts, __context: ctx });
  return res;
}
