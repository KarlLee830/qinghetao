import {updateBackground} from '@discuzqsdk/sdk/dist/api/user/update-background';


export default async function _updateBackground(opts, ctx) {
  const res = await updateBackground({ ...opts, __context: ctx });
  return res;
}
