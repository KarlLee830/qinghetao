import { updateThreads } from '@discuzqsdk/sdk/dist/api/content/update-threads';
/**
 * 发帖接口
 */
export default async function _updateThread(params) {
  const res = await updateThreads({
    data: params,
  });
  return res;
}
