/**
 * 获取未读消息数量
 */
import { readUnreadNotification } from '@discuzqsdk/sdk/dist/api/notice/read-unread-notification';

export default async function _readUnreadCount(opts = {}, ctx = null) {
  const res = await readUnreadNotification({ ...opts, __context: ctx });
  return res;
}
