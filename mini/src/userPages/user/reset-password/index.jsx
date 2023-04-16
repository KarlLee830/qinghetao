import React from 'react';
import { inject, observer } from 'mobx-react';
import Taro, { redirectTo } from '@tarojs/taro';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Input from '@discuzqsdk/design/dist/components/input/index';
import PhoneInput from '@components/login/phone-input';
import { toTCaptcha } from '@common/utils/to-tcaptcha'
import { View } from '@tarojs/components';
import Page from '@components/page';
import layout from './index.module.scss';
import LoginHelper from '@common/utils/login-helper';

@inject('site')
@inject('user')
@inject('thread')
@inject('commonLogin')
@inject('resetPassword')
@observer
class ResetPasswordH5Page extends React.Component {
  constructor() {
    super();
    this.ticket = ''; // 腾讯云验证码返回票据
    this.randstr = ''; // 腾讯云验证码返回随机字符串
    this.onFocus = () => { }
  }


  componentDidMount() {
    // 监听腾讯验证码事件
    Taro.eventCenter.on('captchaResult', this.handleCaptchaResult);
    Taro.eventCenter.on('closeChaReault', this.handleCloseChaReault);
  }

  componentWillUnmount() {
    // 卸载监听腾讯验证码事件
    Taro.eventCenter.off('captchaResult', this.handleCaptchaResult);
    Taro.eventCenter.off('closeChaReault', this.handleCloseChaReault);
    // 重置数据
    this.props.resetPassword.reset();
    this.props.commonLogin.reset();
  }

  // 验证码滑动成功的回调
  handleCaptchaResult = (result) => {
    this.ticket = result.ticket;
    this.randstr = result.randstr;
    this.handleSendCodeButtonClick();
  }

  // 验证码点击关闭的回调
  handleCloseChaReault = () => {
    this.ticket = '';
    this.randstr = '';
  }
  handlePhoneNumCallback = (phoneNum) => {
    const { resetPassword } = this.props;
    resetPassword.mobile = phoneNum;
  };

  handlePhoneCodeCallback = (code) => {
    const { resetPassword } = this.props;
    resetPassword.code = code;
  };

  handleSendCodeButtonClick = async (onFocus) => {
    try {
      const { site, user, resetPassword } = this.props;
      // 发送前校验
      resetPassword.beforeSendVerify(user.originalMobile);
      if (onFocus) {
        this.onFocus = onFocus;
      }
      // 验证码
      const { webConfig } = site;
      const qcloudCaptcha = webConfig?.qcloud?.qcloudCaptcha;
      if (qcloudCaptcha) {
        if (!this.ticket || !this.randstr) {
          const qcloudCaptchaAppId = webConfig?.qcloud?.qcloudCaptchaAppId;
          toTCaptcha(qcloudCaptchaAppId)
          return false;
        }
      };
      await resetPassword.sendCode({
        captchaRandStr: this.randstr,
        captchaTicket: this.ticket
      });
      this.onFocus();
      // 清除
      this.ticket = '';
      this.randstr = '';
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
      commonLogin.setLoginLoading(false);
      await this.props.resetPassword.resetPassword();
      commonLogin.setLoginLoading(true);

      Toast.success({
        content: '重置密码成功',
        hasMask: false,
        duration: 1000,
        onClose: () => {
          LoginHelper.restore();
        }
      });
    } catch (e) {
      this.props.commonLogin.setLoginLoading(true);
      Toast.error({
        content: e.Message,
        hasMask: false,
        duration: 1000,
      });
    }
  };

  render() {
    const { commonLogin: { loginLoading } } = this.props;
    return (
      <Page>
      <View className={layout.container}>
        <View className={layout.content}>
          <View className={layout.title}>找回密码</View>
          <PhoneInput
            phoneNum={this.props.resetPassword.mobile}
            captcha={this.props.resetPassword.code}
            phoneNumCallback={this.handlePhoneNumCallback}
            phoneCodeCallback={this.handlePhoneCodeCallback}
            sendCodeCallback={this.handleSendCodeButtonClick}
            codeTimeout={this.props.resetPassword.codeTimeout}
          />
          <Input
            clearable={false}
            trim
            className={layout.input}
            mode="password"
            value={this.props.resetPassword.newPassword}
            placeholder="新密码"
            onChange={(e) => {
              this.props.resetPassword.newPassword = e.target.value;
            }}
          />
          <Input
            clearable={false}
            trim
            className={layout.input}
            mode="password"
            value={this.props.resetPassword.newPasswordRepeat}
            placeholder="重复新密码"
            onChange={(e) => {
              this.props.resetPassword.newPasswordRepeat = e.target.value;
            }}
          />
          <Button
            className={layout.button}
            type="primary"
            loading={!loginLoading}
            onClick={this.handleResetPasswordButtonClick}
          >
            下一步
          </Button>
        </View>
      </View>
      </Page>
    );
  }
}
export default ResetPasswordH5Page;
