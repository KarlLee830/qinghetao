import {updatePayPwd} from '@discuzqsdk/sdk/dist/api/pay/update-paypwd';
export default async function _updatePayPwd(opts, ctx = null) {
  const res = await updatePayPwd({ ...opts, __context: ctx });
  return res;
}
