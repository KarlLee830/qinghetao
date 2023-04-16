/**
 * 获取对话列表
 */
import { readDialogList } from '@discuzqsdk/sdk/dist/api/notice/read-dialog-list';

export default async function _readDialogList(opts, ctx = null) {
  const res = await readDialogList({ ...opts, __context: ctx });
  return res;
}
