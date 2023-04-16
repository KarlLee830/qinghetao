import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import { Button, Toast } from '@discuzqsdk/design';
import layout from './index.module.scss';
import PhoneInput from '@components/login/phone-input';
import HomeHeader from '@components/home-header';
import Header from '@components/header';
import clearLoginStatus from '@common/utils/clear-login-status';
import PcBodyWrap from '../components/pc-body-wrap';
import { BANNED_USER, REVIEWING, REVIEW_REJECT } from '@common/store/login/util';
import { get } from '@common/utils/get';
import HOCTencentCaptcha from '@middleware/HOCTencentCaptcha';
import { isExtFieldsOpen } from '@common/store/login/util';
import { MOBILE_LOGIN_STORE_ERRORS } from '@common/store/login/mobile-login-store';
import loginHelper from '@common/utils/login-helper';
import Router from '@discuzqsdk/sdk/dist/router';


@inject('site')
@inject('user')
@inject('thread')
@inject('mobileBind')
@inject('commonLogin')
@observer
class BindPhoneH5Page extends React.Component {
  handlePhoneNumCallback = (phoneNum) => {
    const { mobileBind } = this.props;
    mobileBind.mobile = phoneNum;
  }

  handlePhoneCodeCallback = (code) => {
    const { mobileBind } = this.props;
    mobileBind.code = code;
  }

  componentWillUnmount() {
    this.props.mobileBind.reset();
  }

  handleBindButtonClick = async () => {
    try {
      const { commonLogin, router: { query }, user } = this.props;
      if (!commonLogin.loginLoading) {
        return;
      }
      const { sessionToken } = query;
      commonLogin.loginLoading = false;
      const resp = await this.props.mobileBind.bind(sessionToken);
      const uid = get(resp, 'uid', '');
      user.updateUserInfo(uid || user.id);
      Toast.success({
        content: '绑定成功',
        hasMask: false,
        duration: 1000,
        onClose: () => {
          commonLogin.loginLoading = true;
          Router.back();
        }
      });
    } catch (e) {
      this.props.commonLogin.loginLoading = true;
      // 跳转补充信息页
      if (e.Code === MOBILE_LOGIN_STORE_ERRORS.NEED_COMPLETE_REQUIRED_INFO.Code) {
        if (isExtFieldsOpen(this.props.site)) {
          this.props.commonLogin.needToCompleteExtraInfo = true;
          return this.props.router.push('/user/supplementary');
        }
        return loginHelper.restore();
      }

      // 跳转状态页
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
        duration: 1000,
      });
    }
  }

  handleSendCodeButtonClick = async () => {
    try {
      const { commonLogin } = this.props;
      // 发送前校验
      this.props.mobileBind.beforeSendVerify();
      // 验证码
      const { captchaTicket, captchaRandStr } = await this.props.showCaptcha();

      await this.props.mobileBind.sendCode({
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
  }

  getTips = () => {
    const { limitPublishType } = this.props.router.query;
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
    const { mobileBind, site, commonLogin: { loginLoading } } = this.props;
    const { platform, wechatEnv } = site;
    const { limitPublishType } = this.props.router.query;
    return (
      <PcBodyWrap>
      <div className={platform === 'h5' ? layout.container : layout.pc_container}>
        {
          platform === 'h5'
            ? <HomeHeader hideInfo mode='login'/>
            : null
        }
        <div className={platform === 'h5' ? layout.content : layout.pc_content}>
          <div className={platform === 'h5' ? layout.title : layout.pc_title}>绑定手机号</div>
          <div className={platform === 'h5' ? layout.tips : layout.pc_tips}>
            { this.getTips() }
          </div>
          <PhoneInput
            phoneNum={mobileBind.mobile}  // 手机号
            captcha={mobileBind.code} // 验证码
            phoneNumCallback={this.handlePhoneNumCallback} // 手机号输入时的回调
            phoneCodeCallback={this.handlePhoneCodeCallback} // 验证码输入时的回调
            sendCodeCallback={this.handleSendCodeButtonClick} // 验证码点击时的回调
            codeTimeout={mobileBind.codeTimeout} // 验证码倒计时
            enterCallback={this.handleBindButtonClick}
          />
          <Button
            disabled={!mobileBind.isInfoComplete}
            loading={!loginLoading}
            className={platform === 'h5' ? layout.button : layout.pc_button}
            type="primary"
            onClick={this.handleBindButtonClick}
          >
            下一步
          </Button>
          {
            wechatEnv === 'miniProgram' && !limitPublishType
              ? <div className={platform === 'h5' ? layout.functionalRegion : layout.pc_functionalRegion}>
                  <span className={layout.clickBtn} onClick={() => {
                    loginHelper.restore();
                  }} >跳过</span>
                </div>
              : <div className={platform === 'h5' ? layout.functionalRegion : layout.pc_functionalRegion}>
                  <span className={layout.clickBtn} onClick={() => {
                    clearLoginStatus(); // 清除登录态
                    loginHelper.gotoIndex();
                  }} >退出登录</span>
                </div>
          }
        </div>
      </div>
      </PcBodyWrap>
    );
  }
}

export default HOCTencentCaptcha(withRouter(BindPhoneH5Page));
