import { observable, action, computed } from 'mobx';
import { usernameLogin } from '@server';
import { get } from '../../utils/get';
import setAccessToken from '../../utils/set-access-token';
import { checkUserStatus } from '@common/store/login/util';



export const NEED_BIND_WEIXIN_FLAG = -8000;
export const NEED_BIND_PHONE_FLAG = -8001;

export default class UserLoginStore {
  @observable username = '';
  @observable password = '';
  @observable sessionToken = '';
  @observable loginaes = false;
  @observable aesKey = '';
  @observable aesIv = '';

  // 是否信息填写完毕
  @computed get isInfoComplete() {
    return this.username && this.password;
  }



  // 重置参数
  @action
  reset = () => {
    this.username = '';
    this.password = '';
  }

  @action
  login = async () => {
    // 信息需要填写完整
    if (!this.username || !this.password) {
      throw {
        Code: 'ulg_0000',
        Message: '请填写完整信息',
      };
    }

    try {
      const data =  {
        username: this.username,
        password: this.password,
        type: 'mobilebrowser_username_login',
      };


      console.log(data)

      if (this.sessionToken) {
        data.sessionToken = this.sessionToken;
      }
      const loginResp = await usernameLogin({
        data,
      });
      checkUserStatus(loginResp);

      if (loginResp.code === 0) {
        const accessToken = get(loginResp, 'data.accessToken', '');
        // 种下 access_token
        setAccessToken({
          accessToken,
        });
        return loginResp;
      }

      if (loginResp.code === NEED_BIND_PHONE_FLAG) {
        throw {
          Code: NEED_BIND_PHONE_FLAG,
          sessionToken: get(loginResp, 'data.sessionToken'),
          Message: '需要绑定手机号',
        };
      }

      if (loginResp.code === NEED_BIND_WEIXIN_FLAG) {
        // 去除登录态，防止用户携带登录态跳入其他页面
        const accessToken = get(loginResp, 'data.accessToken', '');
        const uid = get(loginResp, 'data.uid', '');
        throw {
          Code: -8000,
          Message: '需要绑定微信',
          sessionToken: get(loginResp, 'data.sessionToken'),
          nickname: get(loginResp, 'data.nickname'),
          uid,
          accessToken,
        };
      }

      throw {
        Code: loginResp.code,
        Message: loginResp.msg,
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
