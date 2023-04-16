import {genMiniScheme} from '@discuzqsdk/sdk/dist/api/login/gen-mini-scheme';
export default async function _genMiniScheme(opts, ctx = null) {
  const res = await genMiniScheme({ ...opts, __context: ctx });
  return res;
}