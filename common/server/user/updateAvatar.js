import {updateAvatar} from '@discuzqsdk/sdk/dist/api/user/update-avatar';


export default async function _updateAvatar(opts, ctx) {
  const res = await updateAvatar({ ...opts, __context: ctx });
  return res;
}
