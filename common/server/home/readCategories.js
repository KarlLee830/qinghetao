import { readCategories } from '@discuzqsdk/sdk/dist/api/home/read-categories';

/** 获取分类列表接口
 * @param {object} params
 * @returns object
 */
export default async function _readCategories(opts, ctx = null) {
  const res = await readCategories({ ...opts, __context: ctx });
  return res;
}