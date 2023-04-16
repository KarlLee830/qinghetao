import { readTopicsList } from '@discuzqsdk/sdk/dist/api/search/read-topics-list';

/** 潮流话题/话题搜索
 * @param {object} params
 * @returns object
 */
export default async function _readTopicsList(opts, ctx = null) {
  const res = await readTopicsList({ ...opts, __context: ctx });
  return res;
}