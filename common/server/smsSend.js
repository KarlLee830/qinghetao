import {smsSend} from '@discuzqsdk/sdk/dist/api/login/smssend';

export default async function _smsSend(opts, ctx) {
  const res = await smsSend({ ...opts, __context: ctx });
  return res;
}