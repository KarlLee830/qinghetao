import {readUser} from '@discuzqsdk/sdk/dist/api/user/read-user';
export default async function _readUser(opts, ctx = null) {
  const res = await readUser({ ...opts, __context: ctx });
  return res;
}