import { readWechatRebindStatus } from '@discuzqsdk/sdk/dist/api/user/read-wechatrebindstatus';

export default async function wechatRebindQrCodeGen(opts, ctx) {
  const res = await readWechatRebindStatus({ ...opts, __context: ctx });
  return res;
}
