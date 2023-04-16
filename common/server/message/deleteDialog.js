/**
 * 删除私信对话
 */
import { deleteDialog } from '@discuzqsdk/sdk/dist/api/notice/delete-dialog';

export default async function _deleteDialog(params) {
  const res = await deleteDialog({ data: params });
  return res;
}
