import {updateDeny} from '@discuzqsdk/sdk/dist/api/user/update-deny';


export default async function _updateDeny(opts, ctx) {
  const res = await updateDeny({ ...opts, __context: ctx });
  return res;
}
