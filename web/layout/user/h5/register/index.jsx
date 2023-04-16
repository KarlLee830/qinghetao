import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import { Input, Button, Toast } from '@discuzqsdk/design';
import layout from './index.module.scss';
import HomeHeader from '@components/home-header';
import Header from '@components/header';
import { BANNED_USER, REVIEWING, REVIEW_REJECT, isExtFieldsOpen } from '@common/store/login/util';
import Protocol from '../components/protocol';
import PcBodyWrap from '../components/pc-body-wrap';
import { get } from '@common/utils/get';
import HOCTencentCaptcha from '@middleware/HOCTencentCaptcha';

import { MOBILE_LOGIN_STORE_ERRORS } from '@common/store/login/mobile-login-store';
// import { TencentCaptcha } from '@discuzqsdk/sdk/dist/common_modules/sliding-captcha';
@inject('site')
@inject('user')
@inject('thread')
@inject('userRegister')
@inject('commonLogin')
@inject('invite')
@observer
class RegisterH5Page extends React.Component {
  handleRegisterBtnClick = async () => {
    try {
      const { router, site: { webConfig } = {}, commonLogin } = this.props;
      if (!commonLogin.loginLoading) {
        return;
      }
      this.props.userRegister.code = this.props.invite.getInviteCode(router);
      this.props.userRegister.verifyForm();
      const registerCaptcha = webConfig?.setReg?.registerCaptcha;
      if (registerCaptcha) {
        await this.showCaptcha();
      }

      await this.toRegister();
    } catch (e) {
      Toast.error({
        content: e.Message,
        hasMask: false,
        duration: 1000,
      });
    }
  }
  async showCaptcha() {
    // 验证码实例为空，则创建实例
    try {
      const { captchaRandStr, captchaTicket } = await this.props.showCaptcha();
      this.props.userRegister.captchaRandStr = captchaRandStr;
      this.props.userRegister.captchaTicket = captchaTicket;
    } catch (e) {
      Toast.error({
        content: e.Message,
        hasMask: false,
        duration: 1000,
      });
    }
  }

  componentWillUnmount() {
    this.props.userRegister.reset();
  }

  toRegister = async () => {
    const { commonLogin, userRegister } = this.props;
    try {
      commonLogin.loginLoading = false;
      this.props.invite.inviteCode;
      const resp = await userRegister.register();
      const uid = get(resp, 'uid', '');
      this.props.user.updateUserInfo(uid);
      Toast.success({
        content: '注册成功',
        hasMask: false,
        onClose: (() => {
          commonLogin.loginLoading = true;
          window.location.href = '/';
        }),
      });
    } catch (e) {
      commonLogin.loginLoading = true;
      // 跳转补充信息页
      if (e.Code === MOBILE_LOGIN_STORE_ERRORS.NEED_COMPLETE_REQUIRED_INFO.Code) {
        const uid = get(e, 'uid', '');
        uid && this.props.user.updateUserInfo(uid);
        if (isExtFieldsOpen(this.props.site)) {
          this.props.commonLogin.needToCompleteExtraInfo = true;
          this.props.router.push('/user/supplementary');
          return;
        }
        return window.location.href = '/';
      }

      if (e.Code === BANNED_USER || e.Code === REVIEWING || e.Code === REVIEW_REJECT) {
        const uid = get(e, 'uid', '');
        uid && this.props.user.updateUserInfo(uid);
        this.props.commonLogin.setStatusMessage(e.Code, e.Message);
        this.props.router.push(`/user/status?statusCode=${e.Code}&statusMsg=${e.Message}`);
        return;
      }

      Toast.error({
        content: e.Message,
        hasMask: false,
        duration: 3000,
      });
    }
  };
  handlePasswordChange = (e) => {
    const val = e?.target?.value?.replace(' ', '');
    this.props.userRegister.password = val || '';
  }
  handlePasswordConfirmationChange = (e) => {
    const val = e?.target?.value?.replace(' ', '');
    this.props.userRegister.passwordConfirmation = val || '';
  }
  render() {
    const { site, commonLogin } = this.props;
    const { platform } = site;
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
          <div className={platform === 'h5' ? layout.title : layout.pc_title}>用户名注册</div>
          <Input
            className={platform === 'h5' ? layout.input : layout.pc_input}
            value={this.props.userRegister.username}
            placeholder="输入您的用户名"
            clearable={true}
            onChange={(e) => {
              this.props.userRegister.username = e.target.value;
            }}
          />
          <Input
            clearable={false}
            className={platform === 'h5' ? layout.input : layout.pc_input}
            mode="password"
            value={this.props.userRegister.password}
            placeholder="输入您的登录密码"
            onChange={this.handlePasswordChange}
          />
          <Input
            clearable={false}
            className={platform === 'h5' ? layout.input : layout.pc_input}
            mode="password"
            value={this.props.userRegister.passwordConfirmation}
            placeholder="确认密码"
            onChange={this.handlePasswordConfirmationChange}
          />
          <Input
            clearable={true}
            className={platform === 'h5' ? layout.input : layout.pc_input}
            value={this.props.userRegister.nickname}
            placeholder="输入您的昵称"
            onChange={(e) => {
              this.props.userRegister.nickname = e.target.value;
            }}
            onEnter={this.handleRegisterBtnClick}
          />
          <Button
            disabled={this.props.userRegister.isInfoNotCpl}
            loading={!loginLoading}
            id="register-btn"
            className={platform === 'h5' ? layout.button : layout.pc_button}
            type="primary"
            onClick={this.handleRegisterBtnClick}
          >
            注册
          </Button>
          <div className={platform === 'h5' ? layout.functionalRegion : layout.pc_functionalRegion}>
            <span> 已有账号? </span>
            <span
              className={layout.clickBtn}
              onClick={() => {
                this.props.router.push('login');
              }}
            >
              登录
            </span>
          </div>
          <Protocol/>
        </div>
      </div>
      </PcBodyWrap>
    );
  }
}

export default HOCTencentCaptcha(withRouter(RegisterH5Page));
