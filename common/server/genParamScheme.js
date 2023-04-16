import { readGenParamScheme } from '@discuzqsdk/sdk/dist/api/content/read-genparamscheme';
export default async function genParamScheme(opts, ctx = null) {
  const res = await readGenParamScheme({ ...opts, __context: ctx });
  return res;
}