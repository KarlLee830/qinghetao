import { reward } from '@discuzqsdk/sdk/dist/api/thread/reward';

export default async function _reward(opts, ctx = null) {
  return await reward({ ...opts, __context: ctx });
}
