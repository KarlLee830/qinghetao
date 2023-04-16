import {inviteUsersList} from '@discuzqsdk/sdk/dist/api/invite/invite-users-list';

/** 邀请用户列表
 * @param {object} params
 * @returns object
 */
export default async function _inviteUsersList(opts, ctx = null) {
  return await inviteUsersList({ ...opts, __context: ctx });
}
