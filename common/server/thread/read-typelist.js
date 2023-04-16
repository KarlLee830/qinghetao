import api from '../api';

export default async function readTypelist(params) {
  const res = await api.http({
    url: '/api/v3/thread.typelist',
    data: params,
  });
  return res;
}
