/**
 * 私信发送消息
 */
import { createDialogMessage } from '@discuzqsdk/sdk/dist/api/notice/create-dialog-message';

export default async function _createDialogMsg(params) {
  const res = await createDialogMessage({ data: params });
  return res;
}
