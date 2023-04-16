import { createThread } from '@discuzqsdk/sdk/dist/api/content/create-thread';

/**
 * 发帖接口
 * TODO: 待更新到sdk
 */
export default async function _createThread(params) {
  const res = await createThread({
    data: params,
  });
  return res;
}
