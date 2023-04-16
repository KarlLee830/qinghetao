import {smsResetPwd} from '@discuzqsdk/sdk/dist/api/login/smsresetpwd';

export default async function _smsResetPwd(opts, ctx = null) {
  const res = await smsResetPwd({ ...opts, __context: ctx });
  return res;
}