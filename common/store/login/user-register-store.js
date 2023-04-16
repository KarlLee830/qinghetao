import { observable, computed, action } from 'mobx';
import { usernameRegister } from '@server';
import { get } from '@common/utils/get';
import setAccessToken from '../../utils/set-access-token';
import { checkUserStatus } from '@common/store/login/util';
export default class UserRegisterStore {
  @observable username = '';
  @observable password = '';
  @observable nickname = '';
  @observable code = ''; // 注册邀请码
  @observable captchaTicket = '';
  @observable captchaRandStr = '';
  @observable passwordConfirmation = '';

  isPasswordSame() {
    return this.password === this.passwordConfirmation;
  }

  @computed get isInfoNotCpl() {
    return !this.username || !this.password || !this.nickname || !this.passwordConfirmation;
  }

  verifyForm() {
    if (this.isInfoNotCpl) {
      throw {
        Code: 'reg_0000',
        Message: '请填写完整信息',
      };
    }

    if (!this.isPasswordSame()) {
      throw {
        Code: 'reg_0001',
        Message: '两次输入的密码不一致',
      };
    }
  }

  // 重置参数
  @action
  reset = () => {
    this.username = '';
    this.password = '';
    this.passwordConfirmation = '';
    this.nickname = '';
  }

  @action
  register = async () => {
    try {
      const registerResp = await usernameRegister({
        data: {
          username: this.username,
          password: this.password,
          nickname: this.nickname,
          passwordConfirmation: this.passwordConfirmation,
          captchaRandStr: this.captchaRandStr,
          captchaTicket: this.captchaTicket,
          code: this.code,
        },
      });
      checkUserStatus(registerResp);

      if (registerResp.code === 0) {
        const accessToken = get(registerResp, 'data.accessToken');
        // 注册成功后，默认登录
        setAccessToken({
          accessToken,
        });
        return registerResp.data;
      }
      throw {
        Code: registerResp.code,
        Message: registerResp.msg,
      };
    } catch (error) {
      if (error.Code) {
        throw error;
      }
      throw {
        Code: 'reg_9999',
        Message: '网络错误',
        error,
      };
    }
  }
}
