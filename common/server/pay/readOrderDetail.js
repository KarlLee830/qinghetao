import {readOrderDetail} from '@discuzqsdk/sdk/dist/api/pay/read-orderdetail';
export default async function _readOrderDetail(opts, ctx = null) {
  const res = await readOrderDetail({ ...opts, __context: ctx });
  return res;
}
