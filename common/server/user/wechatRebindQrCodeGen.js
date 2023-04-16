import { createWechatRebindQrCodeGen } from '@discuzqsdk/sdk/dist/api/user/create-wechatrebindqrcodegen';

export default async function wechatRebindQrCodeGen(opts, ctx) {
  const res = await createWechatRebindQrCodeGen({ ...opts, __context: ctx });
  return res;
}
