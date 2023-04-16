import React, { Component } from 'react';
import Taro, { getCurrentInstance, navigateTo, redirectTo } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { observer, inject } from 'mobx-react';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Input from '@discuzqsdk/design/dist/components/input/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Avatar from '@discuzqsdk/design/dist/components/avatar/index';
import { toTCaptcha } from '@common/utils/to-tcaptcha'
// import { ToastProvider } from '@discuzqsdk/design/dist/components/toast/ToastProvider';
import Page from '@components/page';
import { BANNED_USER, REVIEWING, REVIEW_REJECT, isExtFieldsOpen } from '@common/store/login/util';
import { get } from '@common/utils/get';
import PhoneInput from '@components/login/phone-input'
import layout from './index.module.scss';
import { MOBILE_LOGIN_STORE_ERRORS } from '@common/store/login/mobile-login-store';
import LoginHelper from '@common/utils/login-helper';
// const MemoToastProvider = React.memo(ToastProvider)

@inject('site')
@inject('user')
@inject('commonLogin')
@inject('wxPhoneBind')
@observer
class Index extends Component {
  constructor() {
    super();
    this.ticket = ''; // 腾讯云验证码返回票据
    this.randstr = ''; // 腾讯云验证码返回随机字符串
    this.onFocus = () => {}
  }


  componentDidMount() {
    // 监听腾讯验证码事件
    Taro.eventCenter.on('captchaResult', this.handleCaptchaResult);
    Taro.eventCenter.on('closeChaReault', this.handleCloseChaReault);
  }

  componentWillUnmount() {
    // 卸载监听腾讯验证码事件
    Taro.eventCenter.off('captchaResult', this.handleCaptchaResult)
    Taro.eventCenter.off('closeChaReault', this.handleCloseChaReault)
    // 重置数据
    this.props.wxPhoneBind.reset();
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

  handleSendCodeButtonClick = async (onFocus) => {
    try{
      // 发送前校验
      this.props.wxPhoneBind.beforeSendVerify();
      if (onFocus) {
        this.onFocus = onFocus;
      }
      // 验证码
      const { webConfig } = this.props.site;
      const qcloudCaptcha = webConfig?.qcloud?.qcloudCaptcha;
      if (qcloudCaptcha) {
        if (!this.ticket || !this.randstr) {
          const qcloudCaptchaAppId = webConfig?.qcloud?.qcloudCaptchaAppId;
          await toTCaptcha(qcloudCaptchaAppId)
          return false;
        }
      };
      // 发送
      await this.props.wxPhoneBind.sendCode({
        captchaRandStr: this.randstr,
        captchaTicket: this.ticket
      });
      // 清除
      this.ticket = '';
      this.randstr = '';
      this.onFocus();
    }catch(e){
      Toast.error({
        content: e.Message,
        hasMask: false,
        duration: 1000,
      });
    }
  }

  handleBindButtonClick = async () => {
    const { wxPhoneBind, commonLogin } = this.props;
    const { sessionToken } = getCurrentInstance()?.router?.params;
    try {
      if (!commonLogin.loginLoading) {
        return;
      }
      commonLogin.setLoginLoading(false);
      const resp = await wxPhoneBind.loginAndBind(sessionToken);
      const uid = get(resp, 'uid', '');
      this.props.user.updateUserInfo(uid);
      commonLogin.setLoginLoading(true);
      Toast.success({
        content: '登录成功',
        duration: 1000,
        onClose: () => {
          LoginHelper.restore();
        }
      });
    } catch (error) {
      this.props.commonLogin.setLoginLoading(true);
      // 注册信息补充
      if (error.Code === MOBILE_LOGIN_STORE_ERRORS.NEED_COMPLETE_REQUIRED_INFO.Code) {
        if (isExtFieldsOpen(this.props.site)) {
          this.props.commonLogin.needToCompleteExtraInfo = true;
          redirectTo({ url: '/userPages/user/supplementary/index' });
          return;
        }
        LoginHelper.restore();
        return;
      }
      // 跳转状态页
      if (error.Code === BANNED_USER || error.Code === REVIEWING || error.Code === REVIEW_REJECT) {
        const uid = get(error, 'uid', '');
        uid && this.props.user.updateUserInfo(uid);
        this.props.commonLogin.setStatusMessage(error.Code, error.Message);
        navigateTo({
          url: `/userPages/user/status/index?statusCode=${error.Code}&statusMsg=${error.Message}`
        });
        return;
      }
      Toast.error({
        content: error.Message,
      });
    }
  }

  handlePhoneNumCallback = (phoneNum) => {
    const { wxPhoneBind } = this.props;
    wxPhoneBind.mobile = phoneNum;
  };

  handlePhoneCodeCallback = (code) => {
    const { wxPhoneBind } = this.props;
    wxPhoneBind.code = code;
  };

  render() {
    const { wxPhoneBind, commonLogin } = this.props;
    const { nickname = '' } = getCurrentInstance()?.router?.params || commonLogin;
    return (
      <Page>
        {/* <MemoToastProvider> */}
        <View className={layout.container}>
          <View className={layout.content}>
            <View className={layout.title}>手机号登录，并绑定微信账号</View>
            <View className={layout.tips}>
              <View style={{display: 'flex' }}>hi， 微信用户<Avatar style={{margin: '0 8px'}} circle size='small' image={commonLogin.avatarUrl}/>{nickname}</View>
              <View>请您登录，即可完成微信号和用户名的绑定</View>
            </View>
            <PhoneInput
              phoneNum={wxPhoneBind.mobile}
              captcha={wxPhoneBind.code}
              phoneNumCallback={this.handlePhoneNumCallback}
              phoneCodeCallback={this.handlePhoneCodeCallback}
              sendCodeCallback={this.handleSendCodeButtonClick}
              codeTimeout={wxPhoneBind.codeTimeout}
            />
            {/* 输入框 end */}
            {/* 登录按钮 start */}
            <Button className={layout.button} loading={!commonLogin.loginLoading} type="primary" onClick={this.handleBindButtonClick}>
              登录并绑定
            </Button>
            {/* 登录按钮 end */}
          </View>
        </View>
        {/* </MemoToastProvider> */}
      </Page>
    );
  }
}

export default Index;
