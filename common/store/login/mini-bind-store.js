import { action } from 'mobx';
import { miniBind } from '@server';
import setAccessToken from '../../utils/set-access-token';

export const IS_BINDING__FLAG = -7034;

export default class MiniBindStore {
  @action
  async mobilebrowserBind(data) {
    try {
      const res = await miniBind({
        data,
      });
      if (res.code === 0) {
        // 种下 access_token
        setAccessToken({
          accessToken: data.accessToken,
        });
        return res;
      }
      throw {
        Code: res.code,
        Message: res.msg,
      };
    } catch (error) {
      if (error.Code) {
        throw error;
      }
      throw {
        Code: 'ulg_9999',
        Message: '网络错误',
        error,
      };
    }
  }
}
