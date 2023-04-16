/**
 * 更新私信未读为已读
 */
import { updateDialog } from '@discuzqsdk/sdk/dist/api/notice/update-dialog';

export default async function _updateDialog(opts, ctx = null) {
  const res = await updateDialog({ ...opts, __context: ctx });
  return res;
}
