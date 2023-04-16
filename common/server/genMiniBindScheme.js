import { genMiniBindScheme } from '@discuzqsdk/sdk/dist/api/login/gen-mini-bind-scheme';
export default async function _genMiniBindScheme(opts, ctx = null) {
  const res = await genMiniBindScheme({ ...opts, __context: ctx });
  return res;
}