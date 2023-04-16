import { getServerId } from './get-server-id';
import getPlatform from './get-platform';
import isServer from '@common/utils/is-server';

export const setStatisticParams = (config) => {
  const ua = isServer() ? (config.headers['user-agent'] || '') : window.navigator.userAgent;
  const serverId = getServerId();
  const platfrom = getPlatform(ua);
  config.params = { ...config.params, dzqSid: serverId, dzqPf: platfrom };
  return config;
};
