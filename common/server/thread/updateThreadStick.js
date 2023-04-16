import { updateThreadStick } from '@discuzqsdk/sdk/dist/api/content/update-threadstick';

export default async function _updateThreadStick(opts, ctx = null) {
  const res = await updateThreadStick({ ...opts, __context: ctx });
  return res;
}
