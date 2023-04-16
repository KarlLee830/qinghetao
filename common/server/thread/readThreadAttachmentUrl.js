import { readThreadAttachmentUrl } from '@discuzqsdk/sdk/dist/api/thread/read-threadattachmenturl';

export default async function _readThreadAttachmentUrl(opts, ctx = null) {
  return await readThreadAttachmentUrl({ ...opts, __context: ctx });
}
