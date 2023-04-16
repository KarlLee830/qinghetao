import {usernameRegister} from '@discuzqsdk/sdk/dist/api/login/usernameregister';

export default async function _usernameRegister(opts, ctx = null) {
  const res = await usernameRegister({ ...opts, __context: ctx });
  return res;
}
