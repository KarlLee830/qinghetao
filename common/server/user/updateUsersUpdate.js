import {updateUsersUpdate} from '@discuzqsdk/sdk/dist/api/user/update-usersupdate';

export default async function _updateUsersUpdate(opts, ctx) {
  const res = await updateUsersUpdate({ ...opts, __context: ctx });
  return res;
}
