import { MiniWechatCodeRebind as miniRebind } from '@discuzqsdk/sdk/dist/api/login/mini-wechat-code-rebind';
export default async function _miniRebind(opts, ctx) {
  const res = await miniRebind({ ...opts, __context: ctx });
  return res;
}
