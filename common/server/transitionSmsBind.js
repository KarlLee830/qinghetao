import {transitionSmsBind} from '@discuzqsdk/sdk/dist/api/login/transitionsmsbind';

export default async function _transitionSmsBind(opts, ctx = null) {
  const res = await transitionSmsBind({ ...opts, __context: ctx });
  return res;
}
