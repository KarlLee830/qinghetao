import api from '../api';

export default async function _getCosTmpKey(params) {
  const res = await api.http({
    url: '/api/v3/coskey',
    method: 'post',
    data: params,
  });
  return res;
}
