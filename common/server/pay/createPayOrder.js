import {createPayOrder} from '@discuzqsdk/sdk/dist/api/pay/create-payorder';
export default async function _createPayOrder(opts, ctx = null) {
  const res = await createPayOrder({ ...opts, __context: ctx });
  return res;
}
