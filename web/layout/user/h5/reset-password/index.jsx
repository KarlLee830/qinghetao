import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import { Button, Input, Toast } from '@discuzqsdk/design';
import PhoneInput from '@components/login/phone-input';
import HomeHeader from '@components/home-header';
import Header from '@components/header';
import { get } from '@common/utils/get';
import PcBodyWrap from '../components/pc-body-wrap';
import layout from './index.module.scss';
import HOCTencentCaptcha from '@middleware/HOCTencentCaptcha';
import LoginHelper from '@common/utils/login-helper';

@inject('site')
@inject('user')
@inject('thread')
@inject('commonLogin')
@inject('resetPassword')
@observer
class ResetPasswordH5Page extends React.Component {
  componentWillUnmount() {
    this.props.resetPassword.reset();
  }

  handlePhoneNumCallback = (phoneNum) => {
    const { resetPassword } = this.props;
    resetPassword.mobile = phoneNum;
  };

  handlePhoneCodeCallback = (code) => {
    const { resetPassword } = this.props;
    resetPassword.code = code;
  };

  handleSendCodeButtonClick = async () => {
    try {
      const { user, resetPassword, commonLogin } = this.props;
      // 发送前校验
      resetPassword.beforeSendVerify(user.originalMobile);
      // 验证码
      const { captchaRandStr, captchaTicket } = await this.props.showCaptcha();
      await resetPassword.sendCode({
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

  handleResetPasswordButtonClick = async () => {
    try {
      const { commonLogin } = this.props;
      if (!commonLogin.loginLoading) {
        return;
      }
      commonLogin.loginLoading = false;
      await this.props.resetPassword.resetPassword();

      Toast.success({
        content: '重置密码成功',
        hasMask: false,
        duration: 1000,
      });

      setTimeout(() => {
        commonLogin.loginLoading = true;
        LoginHelper.gotoLogin()
      }, 1000);
    } catch (e) {
      this.props.commonLogin.loginLoading = true;
      Toast.error({
        content: e.Message,
        hasMask: false,
        duration: 1000,
      });
    }
  };

  render() {
    const { site, commonLogin: { loginLoading }  } = this.props;
    const { platform } = site;
    return (
      <PcBodyWrap>
      <div className={platform === 'h5' ? layout.container : layout.pc_container}>
        {
          platform === 'h5'
            ? <HomeHeader hideInfo mode='login'/>
            : null
        }
        <div className={platform === 'h5' ? layout.content : layout.pc_content}>
          <div className={platform === 'h5' ? layout.title : layout.pc_title}>找回密码</div>
          <PhoneInput
            phoneNum={this.props.resetPassword.mobile}
            captcha={this.props.resetPassword.code}
            phoneNumCallback={this.handlePhoneNumCallback}
            phoneCodeCallback={this.handlePhoneCodeCallback}
            sendCodeCallback={this.handleSendCodeButtonClick}
            codeTimeout={this.props.resetPassword.codeTimeout}
          />
          { platform === 'h5' ? <></> : <div className={layout.tips}>新密码</div> }
          <Input
            clearable={false}
            trim
            className={platform === 'h5' ? layout.input : layout.pc_input}
            mode="password"
            value={this.props.resetPassword.newPassword}
            placeholder="新密码"
            onChange={(e) => {
              this.props.resetPassword.newPassword = e.target.value;
            }}
          />
          { platform === 'h5' ? <></> : <div className={layout.tips}>重复新密码</div> }
          <Input
            clearable={false}
            trim
            className={platform === 'h5' ? layout.input : layout.pc_input}
            mode="password"
            value={this.props.resetPassword.newPasswordRepeat}
            placeholder="重复新密码"
            onChange={(e) => {
              this.props.resetPassword.newPasswordRepeat = e.target.value;
            }}
            onEnter={this.handleResetPasswordButtonClick}
          />
          <Button
            loading={!loginLoading}
            disabled={!this.props.resetPassword.isInfoComplete}
            className={platform === 'h5' ? layout.button : layout.pc_button}
            type="primary"
            onClick={this.handleResetPasswordButtonClick}
          >
            下一步
          </Button>
        </div>
      </div>
      </PcBodyWrap>
    );
  }
}
export default HOCTencentCaptcha(withRouter(ResetPasswordH5Page));
