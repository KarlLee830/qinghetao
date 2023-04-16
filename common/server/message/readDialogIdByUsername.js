/**
 * 根据username获取dialogId
 */
import { readDialogRecord } from '@discuzqsdk/sdk/dist/api/notice/read-dialog-record';

export default async function _readDialogIdByUsername(opts, ctx = null) {
  const res = await readDialogRecord({ ...opts, __context: ctx });
  return res;
}
