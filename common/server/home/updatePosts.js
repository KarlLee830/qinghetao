import { updatePosts } from '@discuzqsdk/sdk/dist/api/home/update-posts';

/** 修改评论接口
 * @param {object} params
 * @returns object
 */
export default async function _updatePosts(opts, ctx = null) {
  const res = await updatePosts({ ...opts, __context: ctx, isValidate: false });
  return res;
}
