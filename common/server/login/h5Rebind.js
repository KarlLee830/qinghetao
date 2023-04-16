import { h5WechatCodeRebind } from '@discuzqsdk/sdk/dist/api/login/h5-wechat-code-rebind';
export default async function h5Rebind(opts, ctx) {
  const res = await h5WechatCodeRebind({ ...opts, __context: ctx });
  return res;
}
