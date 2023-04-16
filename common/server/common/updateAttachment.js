import api from '../api';

export default async function _updateAttachment(params) {
  const res = await api.http({
    url: '/api/v3/attachment.relation',
    method: 'post',
    data: params,
  });
  return res;
}
