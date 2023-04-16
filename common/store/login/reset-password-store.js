import { observable, action, computed } from 'mobx';
import { smsResetPwd, smsSend } from '@server';

export const RESET_PASSWORD_STORE_ERRORS = {
  NETWORK_ERROR: {
    Code: 'rps_9999',
    Message: '网络错误',
  },
  BIND_MOBILE_VERIFY_ERROR: {
    Code: 'rps_0007',
    Message: '请填写绑定的手机号',
  },
  MOBILE_VERIFY_ERROR: {
    Code: 'rps_0002',
    Message: '请填写正确的手机号',
  },
  VERIFY_TIME_ERROR: {
    Code: 'rps_0001',
    Message: '请等待倒计时结束后再发送短信',
  },
  NO_MOBILE_ERROR: {
    Code: 'rps_0000',
    Message: '请填写手机号',
  },
  NO_VERIFY_CODE: {
    Code: 'rps_0003',
    Message: '验证码缺失',
  },
  NO_PASSWORD: {
    Code: 'rps_0004',
    Message: '请填写密码',
  },
  NO_PASSWORD_REPEAT: {
    Code: 'rps_0005',
    Message: '请填写重新输入密码字段',
  },
  NO_PASSWORD_EQUAL: {
    Code: 'rps_0006',
    Message: '两次输入的密码不一致',
  },
};

export default class resetPasswordStore {
    codeTimmer = null;

    @observable mobile = '';
    @observable code = '';

    @observable newPassword = '';
    @observable newPasswordRepeat = '';
    @observable codeTimeout = null;


    // 验证码是否符合格式要求
    @computed get isInvalidCode() {
      return this.code.length === 6;
    }

    // 重置参数
    @action
    reset = () => {
      this.mobile = '';
      this.code = '';
      this.newPassword = '';
      this.newPasswordRepeat = '';
      this.codeTimeout = null;
    }

    // 是否信息填写完毕
    @computed get isInfoComplete() {
      return (
        this.code
            && this.mobile
            && this.newPassword
            && this.newPasswordRepeat
            && this.newPassword
      );
    }

    @computed get passwordEqual() {
      return this.newPasswordRepeat === this.newPassword;
    }

    verifyMobile = () => {
      const MOBILE_REGEXP = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/;
      return MOBILE_REGEXP.test(this.mobile);
    }

    beforeSendVerify = (bindMobile) => {
      // 倒计时未结束前，不能再次发送
      if (this.codeTimeout) {
        throw RESET_PASSWORD_STORE_ERRORS.VERIFY_TIME_ERROR;
      }

      // 信息需要填写完整
      if (!this.mobile) {
        throw RESET_PASSWORD_STORE_ERRORS.NO_MOBILE_ERROR;
      }

      // 检验手机号是否合法
      if (!this.verifyMobile()) {
        throw RESET_PASSWORD_STORE_ERRORS.MOBILE_VERIFY_ERROR;
      }

      // 检验手机号是否是当前用户的绑定手机号
      if (bindMobile && bindMobile !== this.mobile) {
        throw RESET_PASSWORD_STORE_ERRORS.BIND_MOBILE_VERIFY_ERROR;
      }
    }

    beforeResetPwdVerify = () => {
      if (!this.newPassword) {
        throw RESET_PASSWORD_STORE_ERRORS.NO_PASSWORD;
      }

      if (!this.newPasswordRepeat) {
        throw RESET_PASSWORD_STORE_ERRORS.NO_PASSWORD_REPEAT;
      }

      if (!this.code) {
        throw RESET_PASSWORD_STORE_ERRORS.NO_VERIFY_CODE;
      }

      if (!this.passwordEqual) {
        throw RESET_PASSWORD_STORE_ERRORS.NO_PASSWORD_EQUAL;
      }
    }

    // 倒计时
    setCounter = (sec) => {
      this.codeTimeout = sec;
      // 总定时器，到时间清除 counter
      this.codeTimmer = setTimeout(() => {
        this.codeTimeout = null;
        this.codeTimmer = null;
      }, Number(this.codeTimeout) * 1000);
      // 每秒 -1
      const counter = () => {
        if (this.codeTimeout) {
          this.codeTimeout = this.codeTimeout - 1;
          setTimeout(() => {
            counter();
          }, 1000);
        }
      };
      setTimeout(() => counter(), 1000);
    }

    @action
    sendCode = async ({captchaRandStr, captchaTicket}) => {
      try {
        const smsResp = await smsSend({

          data: {
            mobile: this.mobile,
            type: 'reset_pwd',
            captchaRandStr,
            captchaTicket
          },
        });
        if (smsResp.code === 0) {
          this.setCounter(smsResp.data.interval);
          return smsResp.data;
        }
        throw {
          Code: smsResp.code,
          Message: smsResp.msg,
        };
      } catch (error) {
        if (error.Code) {
          throw error;
        }
        throw {
          ...RESET_PASSWORD_STORE_ERRORS.NETWORK_ERROR,
          error,
        };
      }
    }

    @action
    resetPassword = async () => {
      this.beforeResetPwdVerify();

      try {
        const resetPwdResp = await smsResetPwd({

          data: {
            mobile: this.mobile,
            password: this.newPassword,
            code: this.code,
          },
        });
        if (resetPwdResp.code === 0) {
          return resetPwdResp.data;
        }
        throw {
          Code: resetPwdResp.code,
          Message: resetPwdResp.msg,
        };
      } catch (error) {
        if (error.Code) {
          throw error;
        }
        throw {
          ...RESET_PASSWORD_STORE_ERRORS.NETWORK_ERROR,
          error,
        };
      }
    }
}
