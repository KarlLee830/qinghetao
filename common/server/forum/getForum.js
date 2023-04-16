import {getForum} from '@discuzqsdk/sdk/dist/api/forum/get-forum';

export default async function _getForum(opts, ctx) {
  const res = await getForum({ ...opts, __context: ctx });
  return res;
};
