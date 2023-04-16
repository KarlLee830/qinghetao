import {smsBind} from '@discuzqsdk/sdk/dist/api/login/smsbind';
export default async function _smsBind(opts, ctx) {
  const res = await smsBind({ ...opts, __context: ctx });
  return res;
}
