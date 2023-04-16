import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import layout from './index.module.scss';
import { Button, Toast, Avatar } from '@discuzqsdk/design';
import HomeHeader from '@components/home-header';
import PhoneInput from '@components/login/phone-input';
import Protocol from '../components/protocol';
import { BANNED_USER, REVIEWING, REVIEW_REJECT } from '@common/store/login/util';
import { get } from '@common/utils/get';
import HOCTencentCaptcha from '@middleware/HOCTencentCaptcha';
import { MOBILE_LOGIN_STORE_ERRORS } from '@common/store/login/mobile-login-store';
import { isExtFieldsOpen } from '@common/store/login/util';

@inject('site')
@inject('user')
@inject('thread')
@inject('wxPhoneBind')
@inject('commonLogin')
@observer
class WXBindPhoneH5Page extends React.Component {
  handlePhoneNumCallback = (phoneNum) => {
    const { wxPhoneBind } = this.props;
    wxPhoneBind.mobile = phoneNum;
  };

  handlePhoneCodeCallback = (code) => {
    const { wxPhoneBind } = this.props;
    wxPhoneBind.code = code;
  };

  componentWillUnmount() {
    this.props.wxPhoneBind.reset();
  }

  handleSendCodeButtonClick = async () => {
    try {
      const { commonLogin } = this.props;
      // 发送前校验
      this.props.wxPhoneBind.beforeSendVerify();
      // 验证码
      const { captchaRandStr, captchaTicket } = await this.props.showCaptcha();
      await this.props.wxPhoneBind.sendCode({
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
  handleBindButtonClick = async () => {
    const { wxPhoneBind, router, commonLogin } = this.props;
    const { sessionToken } = router.query;
    try {
      if (!commonLogin.loginLoading) {
        return;
      }
      commonLogin.loginLoading = false;
      const resp = await wxPhoneBind.loginAndBind(sessionToken);
      commonLogin.loginLoading = true;
      const uid = get(resp, 'uid', '');
      this.props.user.updateUserInfo(uid);
      Toast.success({
        content: '登录成功',
        duration: 1000,
      });

      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      commonLogin.loginLoading = true;
      // 跳转补充信息页
      if (error.Code === MOBILE_LOGIN_STORE_ERRORS.NEED_COMPLETE_REQUIRED_INFO.Code) {
        if (isExtFieldsOpen(this.props.site)) {
          this.props.commonLogin.needToCompleteExtraInfo = true;
          this.props.router.push('/user/supplementary');
          return;
        }
        return window.location.href = '/';
      }
      // 跳转状态页
      if (error.Code === BANNED_USER || error.Code === REVIEWING || error.Code === REVIEW_REJECT) {
        const uid = get(error, 'uid', '');
        uid && this.props.user.updateUserInfo(uid);
        this.props.commonLogin.setStatusMessage(error.Code, error.Message);
        this.props.router.push(`/user/status?statusCode=${error.Code}&statusMsg=${error.Message}`);
        return;
      }
      Toast.error({
        content: error.Message,
      });
    }
  }

  render() {
    const { wxPhoneBind, router, commonLogin, site } = this.props;
    const { nickname, avatarUrl } = router.query;
    // 接受监听一下协议的数据，不能去掉，去掉后协议的点击无反应
    const { protocolVisible, loginLoading } = commonLogin;
    return (
      <div className={layout.container}>
        <HomeHeader hideInfo mode='login'/>
        <div className={layout.content}>
          <div className={layout.title}>手机号登录，并绑定微信账号</div>
          <div className={layout.tips}>
            <div className={layout.tips_user}>
              hi，
              {
                nickname
                  ? <>
                      亲爱的<Avatar
                        style={{ margin: '0 8px' }}
                        circle
                        size='small'
                        image={avatarUrl}
                        text={nickname && nickname.substring(0, 1)}
                        />{nickname}
                    </>
                  : '微信用户'
                }
            </div>
            请您登录，即可完成微信号和手机号的绑定
          </div>
          {/* 手机验证码 start */}
          <PhoneInput
            phoneNum={wxPhoneBind.mobile}
            captcha={wxPhoneBind.code}
            phoneNumCallback={this.handlePhoneNumCallback}
            phoneCodeCallback={this.handlePhoneCodeCallback}
            sendCodeCallback={this.handleSendCodeButtonClick}
            codeTimeout={wxPhoneBind.codeTimeout}
          />
          {/* 手机验证码 end */}
          {/* 登录按钮 start */}
          <Button
            loading={!loginLoading}
            disabled={!wxPhoneBind.isInfoComplete || !wxPhoneBind.isInvalidCode}
            className={layout.button}
            type="primary"
            onClick={this.handleBindButtonClick}
          >
            登录并绑定
          </Button>
          <Protocol/>
        </div>
      </div>
    );
  }
}

export default HOCTencentCaptcha(withRouter(WXBindPhoneH5Page));
