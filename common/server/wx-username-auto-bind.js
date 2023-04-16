import {usernameAutoBind} from '@discuzqsdk/sdk/dist/api/login/wx-username-auto-bind';
export default async function _usernameAutoBind(opts, ctx) {
  const res = await usernameAutoBind({ ...opts, __context: ctx });
  return res;
}
