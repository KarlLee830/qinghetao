import locals from '@common/utils/local-bridge';

const dzqServerId = '__dzq-server-id';

export const getServerId = () => {
  let serverId = locals.get(dzqServerId);
  if (serverId) return serverId;

  const randomNum = Math.random().toString()
    .slice(-8); // 随机8位数
  const nowTime = new Date().getTime();
  serverId = `${randomNum}-${nowTime}`;
  locals.set(dzqServerId, serverId);
  return serverId;
};
