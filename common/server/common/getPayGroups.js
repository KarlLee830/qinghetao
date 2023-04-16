import api from '../api';

export default async function _getPayGroups(params) {
  const res = await api.http({
    url: '/apiv3/upgrade.group',
    method: 'get',
    params,
  });

  return res;
}