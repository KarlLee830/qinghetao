import { inviteDetail } from '@discuzqsdk/sdk/dist/api/invite/invite-detail';

/** 邀请详情
 * @param {object} params
 * @returns object
 */
export default async function _inviteDetail(opts, ctx = null) {
  return await inviteDetail({ ...opts, __context: ctx });
}
