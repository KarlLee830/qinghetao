import {readForum} from '@discuzqsdk/sdk/dist/api/user/read-forum';
export default async function _readForum(opts, ctx = null) {
  const res = await readForum({ ...opts, __context: ctx });
  return res;
}
