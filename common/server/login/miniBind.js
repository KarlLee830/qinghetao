import {miniBind} from '@discuzqsdk/sdk/dist/api/login/mini-bind';

export default async function _miniBind(opts, ctx) {
  const res = await miniBind({ ...opts, __context: ctx });
  return res;
}