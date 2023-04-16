import api from '../api';

export default async function _readDownloadAttachment(params) {
  const res = await api.http({
    url: '/api/v3/attachment.download',
    method: 'get',
    params,
  });

  return res;
}
