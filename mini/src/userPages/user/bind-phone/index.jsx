import React from 'react';
import { inject, observer } from 'mobx-react';
import Taro, { getCurrentInstance, navigateTo, redirectTo, navigateBack } from '@tarojs/taro';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Input from '@discuzqsdk/design/dist/components/input/index';
import { View, Text } from '@tarojs/components';
import Page from '@components/page';
import { BANNED_USER, REVIEWING, REVIEW_REJECT, isExtFieldsOpen } from '@common/store/login/util';
import { toTCaptcha } from '@common/utils/to-tcaptcha'
import PhoneInput from '@components/login/phone-input'
import { get } from '@common/utils/get';
import layout from './index.module.scss';
import { MOBILE_LOGIN_STORE_ERRORS } from '@common/store/login/mobile-login-store';
import LoginHelper from '@common/utils/login-helper';

@inject('site')
@inject('user')
@inject('wxPhoneBind')
@inject('mobileBind')
@inject('commonLogin')
@observer
class BindPhoneH5Page extends React.Component {
  constructor() {
    super();
    this.ticket = ''; // 腾讯云验证码返回票据
    this.randstr = ''; // 腾讯云验证码返回随机字符串
    this.onFocus = () => {}
    const { from = '' } = getCurrentInstance()?.router?.params || {};
    this.state = {
      from
    }
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
    this.props.mobileBind.reset();
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
      this.props.mobileBind.beforeSendVerify();
      if (onFocus) {
        this.onFocus = onFocus;
      }
      // 验证码
      const { webConfig } = this.props.site;
      const qcloudCaptcha = webConfig?.qcloud?.qcloudCaptcha;
      if (qcloudCaptcha) {
        if (!this.ticket || !this.randstr) {
          const qcloudCaptchaAppId = webConfig?.qcloud?.qcloudCaptchaAppId;
          toTCaptcha(qcloudCaptchaAppId)
          return false;
        }
      };
      // 发送
      await this.props.mobileBind.sendCode({
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
        duration: 2000,
      });
    }
  }

  handleBindButtonClick = async () => {
    try {
      const { commonLogin, user} = this.props;
      if (!commonLogin.loginLoading) {
        return;
      }
      const { sessionToken, from = '' } = getCurrentInstance().router.params;
      commonLogin.setLoginLoading(false);
      const resp = await this.props.mobileBind.bind(sessionToken);
      const uid = get(resp, 'uid', '');

      const IS_FROM_BIND_SOURCE = from === 'paybox' || from === 'userCenter'

      if (IS_FROM_BIND_SOURCE) {
        user.updateUserInfo(user.id)
      } else {
        user.updateUserInfo(uid || user.id);
      }
      commonLogin.setLoginLoading(true);

      Toast.success({
        content: '绑定成功',
        hasMask: false,
        duration: 2000,
      });
      setTimeout(() => {
        if (IS_FROM_BIND_SOURCE) {
          navigateBack();
          return;
        }
        LoginHelper.restore();
      }, 2000);
    } catch (e) {
      this.props.commonLogin.setLoginLoading(true);
      // 注册信息补充
      if (e.Code === MOBILE_LOGIN_STORE_ERRORS.NEED_COMPLETE_REQUIRED_INFO.Code) {
        if (isExtFieldsOpen(this.props.site)) {
          this.props.commonLogin.needToCompleteExtraInfo = true;
          redirectTo({ url: '/userPages/user/supplementary/index' });
          return;
        }
        LoginHelper.restore();
        return;
      }

      // 跳转状态页
      if (e.Code === BANNED_USER || e.Code === REVIEWING || e.Code === REVIEW_REJECT) {
        const uid = get(e, 'uid', '');
        uid && this.props.user.updateUserInfo(uid);
        this.props.commonLogin.setStatusMessage(e.Code, e.Message);
        navigateTo({
          url: `/userPages/user/status/index?statusCode=${e.Code}&statusMsg=${e.Message}`
        });
        return;
      }
      Toast.error({
        content: e.Message,
        hasMask: false,
        duration: 2000,
      });
    }
  }

  handlePhoneNumCallback = (phoneNum) => {
    const { mobileBind } = this.props;
    mobileBind.mobile = phoneNum;
  };

  handlePhoneCodeCallback = (code) => {
    const { mobileBind } = this.props;
    mobileBind.code = code;
  };

  getTips = () => {
    const { limitPublishType } = getCurrentInstance()?.router?.params || {};
    let tips = '';
    switch (limitPublishType) {
      case 'comment':
        tips = '绑定手机才能继续发帖'
        break;
      case 'reply':
        tips = '绑定手机才能继续评论'
        break;
      default:
        tips = '请绑定您的手机号'
        break;
    }
    return tips;
  }

  render() {
    const { mobileBind, commonLogin: { loginLoading } } = this.props;
    const { limitPublishType } = getCurrentInstance()?.router?.params || {};
    return (
      <Page>
        <View className={layout.container}>
          {/* <Header/> */}
          <View className={layout.content}>
            <View className={layout.title}>绑定手机号</View>
            <View className={layout.tips}>
              { this.getTips() }
            </View>
            {/* 输入框 start */}
            <PhoneInput
              phoneNum={mobileBind.mobile}
              captcha={mobileBind.code}
              phoneNumCallback={this.handlePhoneNumCallback}
              phoneCodeCallback={this.handlePhoneCodeCallback}
              sendCodeCallback={this.handleSendCodeButtonClick}
              codeTimeout={mobileBind.codeTimeout}
            />
            {/* 输入框 end */}
            <Button className={layout.button} type="primary" loading={!loginLoading} onClick={this.handleBindButtonClick}>
              {(this.state.from === 'userCenter' || this.state.from === 'paybox') ? '绑定' : '下一步'}
            </Button>
            {
              (this.state.from !== 'userCenter' && this.state.from !== 'paybox' && !limitPublishType)
              && (
                <View className={layout.functionalRegion}>
                  <Text className={layout.clickBtn} onClick={() => {
                    LoginHelper.restore();
                  }} >跳过</Text>
                </View>
              )
            }
          </View>
        </View>
      </Page>
    );
  }
}

export default BindPhoneH5Page;
