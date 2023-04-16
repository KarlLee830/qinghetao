import { updateSingleReply } from '@discuzqsdk/sdk/dist/api/thread/update-singlereply';

export default async function _updateSingleReply(opts, ctx = null) {
  return await updateSingleReply({ ...opts, __context: ctx });
}
