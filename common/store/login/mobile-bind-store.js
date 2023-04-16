import { observable, computed, action } from 'mobx';
import { smsBind, smsSend } from '@server';
import { get } from '../../utils/get';
import setAccessToken from '../../utils/set-access-token';
import { checkUserStatus } from '@common/store/login/util';

export const MOBILE_BIND_STORE_ERRORS = {
  MOBILE_VERIFY_ERROR: {
    Code: 'mbb_0002',
    Message: '请填写正确的手机号',
  },
  VERIFY_TIME_ERROR: {
    Code: 'mbb_0001',
    Message: '请等待倒计时结束后再发送短信',
  },
  NO_MOBILE_ERROR: {
    Code: 'mbb_0000',
    Message: '请填写手机号',
  },
  NETWORK_ERROR: {
    Code: 'mbb_9999',
    Message: '网络错误',
  },
  NO_VERIFY_CODE: {
    Code: 'mbb_0003',
    Message: '验证码缺失',
  },
};

export default class mobileBindStore {
    codeTimmer = null;

    @observable mobile = '';
    @observable code = '';
    @observable codeTimeout = null;

    verifyMobile = () => {
      const MOBILE_REGEXP = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/;
      return MOBILE_REGEXP.test(this.mobile);
    }

    beforeSendVerify = () => {
      // 倒计时未结束前，不能再次发送
      if (this.codeTimeout) {
        throw MOBILE_BIND_STORE_ERRORS.VERIFY_TIME_ERROR;
      }

      // 信息需要填写完整
      if (!this.mobile) {
        throw MOBILE_BIND_STORE_ERRORS.NO_MOBILE_ERROR;
      }

      // 检验手机号是否合法
      if (!this.verifyMobile()) {
        throw MOBILE_BIND_STORE_ERRORS.MOBILE_VERIFY_ERROR;
      }
    }

    // 重置参数
    @action
    reset = () => {
      this.mobile = '';
      this.code = '';
      this.codeTimeout = null;
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
            type: 'bind',
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
          ...MOBILE_BIND_STORE_ERRORS.NETWORK_ERROR,
          error,
        };
      }
    }

    beforeBindVerify() {
      if (!this.mobile) {
        throw MOBILE_BIND_STORE_ERRORS.NO_MOBILE_ERROR;
      }

      if (!this.code) {
        throw MOBILE_BIND_STORE_ERRORS.NO_VERIFY_CODE;
      }
    }

    @computed get isInfoComplete() {
      return this.mobile && this.code;
    }

    @action
    bind = async (sessionToken) => {
      this.beforeBindVerify();

      try {
        const smsLoginResp = await smsBind({

          data: {
            mobile: this.mobile,
            code: this.code,
            sessionToken,
          },
        });
        checkUserStatus(smsLoginResp);
        if (smsLoginResp.code === 0) {
          const accessToken = get(smsLoginResp, 'data.accessToken', '');
          // TODO: 中间状态处理
          // 种下 access_token
          setAccessToken({
            accessToken,
          });
          return smsLoginResp.data;
        }
        throw {
          Code: smsLoginResp.code,
          Message: smsLoginResp.msg,
        };
      } catch (error) {
        if (error.Code) {
          throw error;
        }
        throw {
          ...MOBILE_BIND_STORE_ERRORS.NETWORK_ERROR,
          error,
        };
      }
    }
}
