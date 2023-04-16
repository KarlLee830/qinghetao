import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import { Input, Button, Toast, Icon } from '@discuzqsdk/design';
import layout from './index.module.scss';
import HomeHeader from '@components/home-header';
import Header from '@components/header';
import { NEED_BIND_WEIXIN_FLAG, NEED_BIND_PHONE_FLAG } from '@common/store/login/user-login-store';
import { BANNED_USER, REVIEWING, REVIEW_REJECT, isExtFieldsOpen } from '@common/store/login/util';
import { get } from '@common/utils/get';
import { genMiniScheme } from '@server';
import Protocol from '../components/protocol';
import browser from '../../../../../common/utils/browser';
import PcBodyWrap from '../components/pc-body-wrap';

import { MOBILE_LOGIN_STORE_ERRORS } from '@common/store/login/mobile-login-store';
import CryptoJS from 'crypto-js'

@inject('site')
@inject('user')
@inject('thread')
@inject('userLogin')
@inject('commonLogin')
@observer
class UsernameH5Login extends React.Component {

  Encrypt = (str) => {
    const { setSite } = this.props.site.webConfig;
    const { aesKey,aesIv } = setSite;

    let TheaesKey = CryptoJS.enc.Utf8.parse(aesKey);
    let TheaesIv = CryptoJS.enc.Utf8.parse(aesIv);
    let encrypted = CryptoJS.AES.encrypt(str, TheaesKey, {
      iv: TheaesIv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString()
  }
  handleUsernameChange = (e) => {
    this.props.userLogin.username = e.target.value;
  };

  handlePasswordChange = (e) => {
    this.props.userLogin.password = e.target.value;
  };

  componentWillUnmount() {
    this.props.userLogin.reset();
  }

  loginErrorHandler = async (e) => {
    // 补充昵称
    if (e.Code === MOBILE_LOGIN_STORE_ERRORS.NEED_BIND_USERNAME.Code || e.Code === MOBILE_LOGIN_STORE_ERRORS.NEED_ALL_INFO.Code) {
      const uid = get(e, 'uid', '');
      uid && this.props.user.updateUserInfo(uid);

      if (e.Code === MOBILE_LOGIN_STORE_ERRORS.NEED_ALL_INFO.Code) {
        this.props.commonLogin.needToCompleteExtraInfo = true;
      }

      this.props.router.replace('/user/bind-nickname');
      return;
    }

    // 跳转补充信息页
    if (e.Code === MOBILE_LOGIN_STORE_ERRORS.NEED_COMPLETE_REQUIRED_INFO.Code) {
      const uid = get(e, 'uid', '');
      uid && this.props.user.updateUserInfo(uid);
      if (isExtFieldsOpen(this.props.site)) {
        this.props.commonLogin.needToCompleteExtraInfo = true;
        return this.props.router.replace('/user/supplementary');
      }
      return window.location.href = '/';
    }

    // 微信绑定
    if (e.Code === NEED_BIND_WEIXIN_FLAG) {
      const { wechatEnv, platform } = this.props.site;
      // 设置缓存
      if (e.uid) {
        this.props.commonLogin.setUserId(e.uid);
      }
      e.accessToken && this.props.commonLogin.setLoginToken(e.accessToken);
      this.props.commonLogin.needToBindWechat = true;
      this.props.commonLogin.sessionToken = e.sessionToken;
      this.props.router.replace(`/user/wx-bind-qrcode?sessionToken=${e.sessionToken}&loginType=${platform}&nickname=${e.nickname}&isSkip=${true}`);
      return;
    }

    // 手机号绑定 flag
    if (e.Code === NEED_BIND_PHONE_FLAG) {
      this.props.commonLogin.needToBindPhone = true;
      this.props.router.replace(`/user/bind-phone?sessionToken=${e.sessionToken}`);
      return;
    }

    // 跳转状态页
    if (e.Code === BANNED_USER || e.Code === REVIEWING || e.Code === REVIEW_REJECT) {
      const uid = get(e, 'uid', '');
      uid && this.props.user.updateUserInfo(uid);
      this.props.commonLogin.setStatusMessage(e.Code, e.Message);
      this.props.router.replace(`/user/status?statusCode=${e.Code}&statusMsg=${e.Message}`);
      return;
    }

    Toast.error({
      content: e.Message || e,
      hasMask: false,
      duration: 1000,
    });
  }

  handleLoginButtonClick = async () => {
    const { commonLogin } = this.props;
    try {
      if (!commonLogin.loginLoading) {
        return;
      }
      commonLogin.loginLoading = false;
      const { setSite } = this.props.site.webConfig;
      const { loginaes } = setSite;
      let username = this.props.userLogin.username;
      let password = this.props.userLogin.password;

      if (loginaes){
        this.props.userLogin.username = this.Encrypt(username);
        this.props.userLogin.password = this.Encrypt(password);
      }

      const resp = await this.props.userLogin.login();
      commonLogin.loginLoading = true;
      const uid = get(resp, 'data.uid', '');
      this.props.user.updateUserInfo(uid);
      Toast.success({
        content: '登录成功',
        hasMask: false,
        duration: 1000,
        onClose() {
          window.location.href = '/';
        },
      });
    } catch (e) {
      commonLogin.loginLoading = true;
      this.loginErrorHandler(e);
    }
  };

  render() {
    const { site, commonLogin, invite, router } = this.props;
    const { platform } = site;
    const isAnotherLoginWayAvailable = this.props.site.wechatEnv !== 'none' || this.props.site.isSmsOpen;
    // 接受监听一下协议的数据，不能去掉，去掉后协议的点击无反应
    const { protocolVisible, loginLoading } = commonLogin;
    return (
      <PcBodyWrap>
      <div className={platform === 'h5' ? layout.container : layout.pc_container}>
        {
          platform === 'h5'
            ? <HomeHeader hideInfo mode='login'/>
            : null
        }
        <div className={platform === 'h5' ? layout.content : layout.pc_content}>
          <div className={platform === 'h5' ? layout.title : layout.pc_title}>用户名登录</div>
          {/* 输入框 start */}
          { platform === 'h5' ? <></> : <div className={layout.tips}>用户名</div> }
          <Input
            className={platform === 'h5' ? layout.input : layout.pc_input}
            clearable={true}
            value={this.props.userLogin.username}
            placeholder="输入您的用户名"
            onChange={this.handleUsernameChange}
          />
          { platform === 'h5' ? <></> : <div className={layout.tips}>登录密码</div> }
          <Input
            clearable={false}
            className={platform === 'h5' ? layout.input : layout.pc_input}
            mode="password"
            value={this.props.userLogin.password}
            placeholder="输入您的登录密码"
            onChange={this.handlePasswordChange}
            onEnter={this.handleLoginButtonClick}
          />
          {/* 输入框 end */}
          {/* 登录按钮 start */}
          <Button loading={!loginLoading} disabled={!this.props.userLogin.isInfoComplete} className={platform === 'h5' ? layout.button : layout.pc_button} type="primary" onClick={this.handleLoginButtonClick}>
            登录
          </Button>
          {/* 登录按钮 end */}
          <div className={platform === 'h5' ? layout.functionalRegion : layout.pc_functionalRegion}>
            {site.isRegister && (
              <span
                className={layout.clickBtn}
                onClick={() => {
                  router.replace('register');
                }}
              >
                注册用户
              </span>
            )}
            {site.isSmsOpen && (
              <>
                <span> 忘记密码? </span>
                <span
                  className={layout.clickBtn}
                  onClick={() => {
                    router.replace('reset-password');
                  }}
                >
                  找回密码
                </span>
              </>
            )}
          </div>
          {isAnotherLoginWayAvailable && <div className={platform === 'h5' ? layout['otherLogin-title'] : layout.pc_otherLogin_title}>其他登录方式</div>}
          <div className={platform === 'h5' ? layout['otherLogin-button'] : layout.pc_otherLogin_button}>
            {site.wechatEnv !== 'none' && (
              <span
                onClick={() => {
                  if (browser.env('weixin')) {
                    let inviteCode = invite.getInviteCode(router);
                    if (inviteCode) inviteCode = `?inviteCode=${inviteCode}`;
                    const redirectEncodeUrl = encodeURIComponent(`${window.location.origin}/user/wx-auth${inviteCode}`);
                    window.location.href = `${window.location.origin}/api/v3/users/wechat/h5.oauth?redirect=${redirectEncodeUrl}`;
                    return;
                  }

                  router.replace('wx-login');
                }}
                className={platform === 'h5' ? layout['otherLogin-button-weixin'] : layout.button_left}
              >
                <Icon size={20} name='WeChatOutlinedThick' color='#04C160'/>
              </span>
            )}
            {site.isSmsOpen && (
              <span
                onClick={() => {
                  router.replace('phone-login');
                }}
                className={platform === 'h5' ? layout['otherLogin-button-phone'] : layout.button_right}
              >
              <Icon size={20} name='PhoneOutlined' color='#FFC300'/>
              </span>
            )}
          </div>
          <Protocol/>
        </div>
      </div>
      </PcBodyWrap>
    );
  }
}

export default withRouter(UsernameH5Login);
