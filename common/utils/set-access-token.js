import locals from './local-bridge';
import constants from '../constants/index';
import isServer from './is-server';
export const setCookie = (name, value, exdays) => {
  if (isServer()) return;
  if (parseInt(exdays)) {
    const exp = new Date();
    exp.setTime(exp.getTime() + exdays * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${exp.toGMTString()};path=/;`;
    return;
  }
  document.cookie = `${name}=${value};path=/;`;
};

export const getCookie = (cname) => {
  if (isServer()) return;
  let arr;
  const reg = new RegExp(`(^| )${cname}=([^;]*)(;|$)`);
  if (arr = document.cookie.match(reg)) return arr[2];
  return null;
};

const setAccessToken = ({
  accessToken,
}) => {
  if (!accessToken) return;
  const expireSeconds = 30 * 24 * 60 * 60 * 1000;
  setCookie(constants.ACCESS_TOKEN_NAME, accessToken, 30);
  locals.set(constants.ACCESS_TOKEN_NAME, accessToken, expireSeconds);
};

export default setAccessToken;
