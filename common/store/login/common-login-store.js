import { observable, action } from 'mobx';
import locals from '@common/utils/local-bridge';
import { setCookie } from '@common/utils/set-access-token';
import { get } from '../../utils/get';


const USER_STATUS_MAP = {
  '-4009': '您的账号已禁用',
  2: '恭喜您！已成功登录。先随便逛逛等待账号审核通过！',
  '-4007': '您的账号注册审核不通过',
};

export default class commonLoginStore {
    @observable needToSetNickname = false;
    @observable needToCompleteExtraInfo = false;
    @observable needToBindPhone = false;
    @observable needToBindWechat = false;
    @observable needToBindMini = false;
    @observable sessionToken = '';
    @observable statusMessage = '';
    @observable statusCountDown = 5;
    @observable nickName = '';
    @observable avatarUrl = '';
    @observable captchaTicket = '';
    @observable captchaRandStr = '';
    @observable captcha = null;
    @observable isSend = false;
    @observable statusCode = null;
    @observable statusMsg = '';
    @observable jsCode = '';
    @observable protocolVisible = false;
    @observable protocolStatus = 'register';
    @observable loginLoading = true;
    @observable loginToken = '';

    @action getLoginToken() {
      let loginToken;
      if (typeof window === 'object') {
        loginToken = window?.sessionStorage?.getItem('loginToken') || this.loginToken ||  '';
      }
      return loginToken;
    }

    @action setLoginToken(loginToken) {
      this.loginToken = loginToken;
      typeof window === 'object' && window.sessionStorage?.setItem('loginToken', loginToken);
    }

    @action
    setLoginLoading(loginLoading) {
      this.loginLoading = loginLoading;
    }

    @action
    reset = () => {
      this.loginLoading = true;
    }

    @action
    setStatusCountDown(countDown) {
      this.statusCountDown = countDown;
    }

    @action
    setProtocolInfo(type) {
      this.setProtocolVisible(true);
      this.setProtocolStatus(type);
    }

    @action
    setProtocolVisible(protocolVisible) {
      this.protocolVisible = protocolVisible;
    }

    @action
    setProtocolStatus(protocolStatus) {
      this.protocolStatus = protocolStatus;
    }

    @action
    setUserId(userId) {
      if (!userId) return;
      const expireSeconds = 30 * 24 * 60 * 60 * 1000;
      setCookie('dzq_user_id', userId, 30);
      locals.set('dzq_user_id', userId, expireSeconds);
    }

    @action
    setSessionToken(sessionToken) {
      this.sessionToken = sessionToken;
    }

    @action
    setIsSend(isSend) {
      this.isSend = isSend;
    }

    @action
    setNickname(nickName) {
      this.nickName = nickName;
    }

    @action
    setAvatarUrl(avatarUrl) {
      this.avatarUrl = avatarUrl;
    }

    @action
    setStatusMessage(code, cause = '') {
      const causeMes = cause ? `，原因：${cause}` : '';
      this.statusCode = code;
      this.statusMsg = cause;
      this.statusMessage = `${USER_STATUS_MAP[code] || ''}${causeMes}`;
      return this.statusMessage;
    }

    @action
    setJsCode(code) {
      this.jsCode = code;
    }
}
