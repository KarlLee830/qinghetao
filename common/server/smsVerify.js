import {smsVerify} from '@discuzqsdk/sdk/dist/api/login/smsverify';

export default async function _smsVerify(opts, ctx = null) {
  const res = await smsVerify({ ...opts, __context: ctx });
  return res;
}
