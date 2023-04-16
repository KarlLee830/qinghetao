import {getSignInFields} from '@discuzqsdk/sdk/dist/api/login/get-sign-in-fields';
export default async function _getSignInFields(opts, ctx) {
  return await getSignInFields({ ...opts, __context: ctx });
}