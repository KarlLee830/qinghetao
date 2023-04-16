import {deleteDeny} from '@discuzqsdk/sdk/dist/api/user/delete-deny';

export default async function _deleteDeny(opts, ctx) {
  const res = await deleteDeny({ ...opts, __context: ctx });
  return res;
}