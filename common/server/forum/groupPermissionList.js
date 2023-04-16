import {groupPermissionList} from '@discuzqsdk/sdk/dist/api/forum/group-permission-list';

export default async function _groupPermissionList(opts, ctx) {
  const res = await groupPermissionList({ ...opts, __context: ctx });
  return res;
};
