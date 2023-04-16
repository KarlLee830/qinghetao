/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
import isServer from './is-server';
import formatCookie from '@common/utils/format-cookie';
import locals from '@common/utils/local-bridge';
import constants from '@common/constants';

export default function setAuthorization(config) {
  let token;
  if (isServer() && config.__context) {
    const { headers } = config.__context.req;
    const { cookie } = headers;
    const cookieData = formatCookie(cookie);
    if (cookieData) {
      token = cookieData.access_token || undefined;
      delete config.__context;
    }
  } else {
    // web端
    if (process.env.DISCUZ_ENV === 'web') {
      token = locals.get(constants.ACCESS_TOKEN_NAME);
    } else {
      // 小程序登录态处理
      token = locals.get(constants.ACCESS_TOKEN_NAME);
    }
  }

  if (token && !config?._noSetAuthorization) {
    config.headers = config.headers ? { ...config.headers, authorization: `Bearer ${token}` } : { authorization: `Bearer ${token}` };
  }
  return config;
}
