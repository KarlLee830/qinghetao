import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import { Button, Toast, Icon } from '@discuzqsdk/design';
import layout from './index.module.scss';
import PhoneInput from '@components/login/phone-input';
import HomeHeader from '@components/home-header';
import Header from '@components/header';
import { MOBILE_LOGIN_STORE_ERRORS } from '@common/store/login/mobile-login-store';
import { BANNED_USER, REVIEWING, REVIEW_REJECT, isExtFieldsOpen } from '@common/store/login/util';
import { get } from '@common/utils/get';
import { genMiniScheme } from '@server';
import PcBodyWrap from '../components/pc-body-wrap';
import Protocol from '../components/protocol';
import browser from '../../../../../common/utils/browser';
import HOCTencentCaptcha from '@middleware/HOCTencentCaptcha';


@inject('site')
@inject('user')
@inject('thread')
@inject('commonLogin')
@inject('mobileLogin')
@inject('invite')
@observer
class LoginPhoneH5Page extends React.Component {
  handlePhoneNumCallback = (phoneNum) => {
    const { mobileLogin } = this.props;
    mobileLogin.mobile = phoneNum;
  };

  handlePhoneCodeCallback = (code) => {
    const { mobileLogin } = this.props;
    mobileLogin.code = code;
  };

  componentWillUnmount() {
    this.props.mobileLogin.reset();
  }

  handleLoginButtonClick = async () => {
    try {
      const { mobileLogin, router, invite, commonLogin } = this.props;
      if (!commonLogin.loginLoading || !mobileLogin.isInvalidCode || !mobileLogin.verifyMobile()) {
        return;
      }
      commonLogin.loginLoading = false;
      this.props.mobileLogin.inviteCode = invite.getInviteCode(router);
      const resp = await this.props.mobileLogin.login();
      commonLogin.loginLoading = true;
      const uid = get(resp, 'uid', '');
      this.props.user.updateUserInfo(uid);
      Toast.success({
        content: '登录成功',
        hasMask: false,
        duration: 1000,
        onClose: () => {
          window.location.href = '/';
        },
      });
    } catch (e) {
      this.props.commonLogin.loginLoading = true;
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

      const { site } = this.props;
      // 跳转补充信息页
      if (e.Code === MOBILE_LOGIN_STORE_ERRORS.NEED_COMPLETE_REQUIRED_INFO.Code) {
        if (isExtFieldsOpen(site)) {
          this.props.commonLogin.needToCompleteExtraInfo = true;
          this.props.router.replace('/user/supplementary');
          return;
        }
        return window.location.href = '/';
      }

      if (e.Code === MOBILE_LOGIN_STORE_ERRORS.NEED_ALL_INFO.Code) {
        this.props.commonLogin.needToSetNickname = true;
        this.props.commonLogin.needToCompleteExtraInfo = true;
        this.props.router.replace('/user/bind-nickname?needToCompleteExtraInfo=true');
        return;
      }

      // 微信绑定
      if (e.Code === MOBILE_LOGIN_STORE_ERRORS.NEED_BIND_WECHAT.Code) {
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

      // 跳转状态页
      if (e.Code === BANNED_USER || e.Code === REVIEWING || e.Code === REVIEW_REJECT) {
        const uid = get(e, 'uid', '');
        uid && this.props.user.updateUserInfo(uid);
        this.props.commonLogin.setStatusMessage(e.Code, e.Message);
        this.props.router.replace(`/user/status?statusCode=${e.Code}&statusMsg=${e.Message}`);
        return;
      }

      Toast.error({
        content: e.Message,
        hasMask: false,
        duration: 1000,
      });
    }
  };

  handleSendCodeButtonClick = async () => {
    try {
      const { commonLogin } = this.props;
      // 发送前校验
      this.props.mobileLogin.beforeSendVerify();
      // 验证码
      const { captchaRandStr, captchaTicket } = await this.props.showCaptcha();

      await this.props.mobileLogin.sendCode({
        captchaRandStr,
        captchaTicket,
      });
      commonLogin.setIsSend(true);
    } catch (e) {
      Toast.error({
        content: e.Message,
        hasMask: false,
        duration: 1000,
      });
    }
  };

  goToWechatLogin = () => {
    if (browser.env('weixin')) {
      let inviteCode = this.props.invite.getInviteCode(this.props.router);
      if (inviteCode) inviteCode = `?inviteCode=${inviteCode}`;
      const redirectEncodeUrl = encodeURIComponent(`${window.location.origin}/user/wx-auth${inviteCode}`);
      window.location.href = `${window.location.origin}/api/v3/users/wechat/h5.oauth?redirect=${redirectEncodeUrl}`;
      return;
    }

    this.props.router.replace('wx-login');
  }

  goToUsernameLogin = () => {
    this.props.router.replace('username-login');
  }

  render() {
    const { mobileLogin, site, commonLogin } = this.props;
    const { platform } = site;
    const isAnotherLoginWayAvaliable = this.props.site.wechatEnv !== 'none' || this.props.site.isUserLoginVisible;
    // 接受监听一下协议的数据，不能去掉，去掉后协议的点击无反应
    const { protocolVisible, loginLoading } = commonLogin;
    /**
     * TODO 样式这块待修改，pc、h5分开两个文件，类名保持一直，根据platform来判断加载哪个文件的layout
     */
    return (
      <PcBodyWrap>
      <div className={platform === 'h5' ? layout.container : layout.pc_container}>
        {
          platform === 'h5'
            ? <HomeHeader hideInfo mode='login'/>
            : null
        }
        <div className={platform === 'h5' ? layout.content : layout.pc_content}>
          <div className={platform === 'h5' ? layout.title : layout.pc_title}>手机号码登录/注册</div>
          <PhoneInput
            phoneNum={mobileLogin.mobile}
            captcha={mobileLogin.code}
            phoneNumCallback={this.handlePhoneNumCallback}
            phoneCodeCallback={this.handlePhoneCodeCallback}
            sendCodeCallback={this.handleSendCodeButtonClick}
            enterCallback={this.handleLoginButtonClick}
            codeTimeout={mobileLogin.codeTimeout}
          />
          {/* 登录按钮 start */}
          <Button
            disabled={!mobileLogin.isInvalidCode || !mobileLogin.verifyMobile()}
            className={platform === 'h5' ? layout.button : layout.pc_button}
            type="primary"
            onClick={this.handleLoginButtonClick}
            loading={!loginLoading}
          >
            登录
          </Button>
          {/* 登录按钮 end */}
          {isAnotherLoginWayAvaliable && <div className={platform === 'h5' ? layout['otherLogin-title'] : layout.pc_otherLogin_title}>其他登录方式</div>}
          <div className={platform === 'h5' ? layout['otherLogin-button'] : layout.pc_otherLogin_button}>
            {this.props.site.wechatEnv !== 'none' && (
              <span
                onClick={this.goToWechatLogin}
                className={platform === 'h5' ? layout['otherLogin-button-weixin'] : layout.button_left}
              >
                <Icon size={20} name='WeChatOutlinedThick' color='#04C160'/>
              </span>
            )}
            {this.props.site.isUserLoginVisible && (
              <span
                onClick={this.goToUsernameLogin}
                className={platform === 'h5' ? layout['otherLogin-button-user'] : layout.button_right}
              >
                <Icon size={20} name='UserOutlined' color='#4084FF'/>
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

export default HOCTencentCaptcha(withRouter(LoginPhoneH5Page));
