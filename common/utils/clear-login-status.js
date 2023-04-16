import locals from '@common/utils/local-bridge';
import constants from '@common/constants';
import { setCookie } from './set-access-token';
export default function clearLoginStatus() {
  locals.remove(constants.ACCESS_TOKEN_NAME);
  if (process.env.DISCUZ_ENV === 'web') {
    setCookie(constants.ACCESS_TOKEN_NAME, '', -1);
  }
}
