import {readTopicsList} from '@discuzqsdk/sdk/dist/api/content/read-topicslist';

/**
 * 获取话题列表
 */
export default async function _readTopics(opt = {}) {
  const res = await readTopicsList({ ...opt });
  return res;
}