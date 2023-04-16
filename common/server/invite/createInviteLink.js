import {createInviteLink} from '@discuzqsdk/sdk/dist/api/invite/create-invite-link';
/** 创建邀请链接
 * @param {object} params
 * @returns object
 */
export default async function _createInviteLink(opts, ctx = null) {
  return await createInviteLink({ ...opts, __context: ctx });
}