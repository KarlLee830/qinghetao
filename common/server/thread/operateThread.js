import { operateThread } from '@discuzqsdk/sdk/dist/api/thread/operate-thread';

export default async function _operateThread(opts, ctx = null) {
  return await operateThread({ ...opts, __context: ctx });
}
