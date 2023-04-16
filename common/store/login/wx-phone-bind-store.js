import { observable, action, computed } from 'mobx';
import { smsSend, transitionSmsBind } from '@server';
import { get } from '../../utils/get';
import setAccessToken from '../../utils/set-access-token';
import { checkUserStatus } from '@common/store/login/util';

export const WX_PHONE_BIND_STORE_ERROR = {
  MOBILE_VERIFY_ERROR: {
    Code: 'wpb_0002',
    Message: '请填写正确的手机号',
  },
  VERIFY_TIME_ERROR: {
    Code: 'wpb_0001',
    Message: '请等待倒计时结束后再发送短信',
  },
  NO_MOBILE_ERROR: {
    Code: 'wpb_0000',
    Message: '请填写手机号',
  },
  NETWORK_ERROR: {
    Code: 'wpb_9999',
    Message: '网络错误',
  },
  NO_VERIFY_CODE: {
    Code: 'wpb_0003',
    Message: '验证码缺失',
  },
  NEED_BIND_USERNAME: {
    Code: 'wpb_0004',
    Message: '需要补充昵称',
  },
  NEED_COMPLETE_REQUIRED_INFO: {
    Code: 'wpb_0005',
    Message: '需要补充附加信息',
  },
  NEED_ALL_INFO: {
    Code: 'wpb_0006',
    Message: '需要补充昵称和附加信息',
  },
};

export default class wxPhoneBindStore {
    codeTimmer = null;

    @observable mobile = '';
    @observable code = '';
    @observable codeTimeout = null;

    @observable needToSetNickname = false;
    @observable needToCompleteExtraInfo = false;

    // 验证码是否符合格式要求
    @computed get isInvalidCode() {
      return this.code.length === 6;
    }

    // 重置参数
    @action
    reset = () => {
      this.mobile = '';
      this.code = '';
      this.codeTimeout = null;
    }

    // 是否信息填写完毕
    @computed get isInfoComplete() {
      return this.code && this.mobile;
    }

    verifyMobile = () => {
      const MOBILE_REGEXP = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/;
      return MOBILE_REGEXP.test(this.mobile);
    }

    beforeSendVerify = () => {
      // 倒计时未结束前，不能再次发送
      if (this.codeTimeout) {
        throw WX_PHONE_BIND_STORE_ERROR.VERIFY_TIME_ERROR;
      }

      // 信息需要填写完整
      if (!this.mobile) {
        throw WX_PHONE_BIND_STORE_ERROR.NO_MOBILE_ERROR;
      }

      // 检验手机号是否合法
      if (!this.verifyMobile()) {
        throw WX_PHONE_BIND_STORE_ERROR.MOBILE_VERIFY_ERROR;
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
            type: 'login',
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
          ...WX_PHONE_BIND_STORE_ERROR.NETWORK_ERROR,
          error,
        };
      }
    }

    beforeLoginVerify = () => {
      if (!this.mobile) {
        throw WX_PHONE_BIND_STORE_ERROR.NO_MOBILE_ERROR;
      }

      if (!this.code) {
        throw WX_PHONE_BIND_STORE_ERROR.NO_VERIFY_CODE;
      }
    }

    checkCompleteUserInfo = (smsLoginResp) => {
      // 如果没有填写昵称，抛出需要填写昵称的状态码
      const isMissNickname = get(smsLoginResp, 'data.isMissNickname', false);
      const isMissRequireInfo = get(smsLoginResp, 'data.userStatus') === 10;

      if (isMissRequireInfo && isMissNickname) {
        this.needToCompleteExtraInfo = true;
        this.needToSetNickname = true;
        throw WX_PHONE_BIND_STORE_ERROR.NEED_ALL_INFO;
      }

      if (isMissRequireInfo) {
        this.needToCompleteExtraInfo = true;
        throw WX_PHONE_BIND_STORE_ERROR.NEED_COMPLETE_REQUIRED_INFO;
      }

      if (isMissNickname) {
        this.needToSetNickname = true;
        throw WX_PHONE_BIND_STORE_ERROR.NEED_BIND_USERNAME;
      }
    }

    @action
    loginAndBind = async (sessionToken) => {
      this.beforeLoginVerify();

      try {
        const smsLoginResp = await transitionSmsBind({
          data: {
            mobile: this.mobile,
            code: this.code,
            sessionToken,
          },
        });

        checkUserStatus(smsLoginResp);
        if (smsLoginResp.code === 0) {
          const accessToken = get(smsLoginResp, 'data.accessToken', '');
          // 种下 access_token
          setAccessToken({
            accessToken,
          });

          this.checkCompleteUserInfo(smsLoginResp);

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
          ...WX_PHONE_BIND_STORE_ERROR.NETWORK_ERROR,
          error,
        };
      }
    }
}
