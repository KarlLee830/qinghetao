import {miniLogin} from '@discuzqsdk/sdk/dist/api/login/mini-login';

export default async function _miniLogin(opts, ctx) {
  const res = await miniLogin({ ...opts, __context: ctx });
  return res;
}