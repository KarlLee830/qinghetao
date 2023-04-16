import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import layout from './index.module.scss';
import { Icon, Toast } from '@discuzqsdk/design';
import WeixinQrCode from '@components/login/wx-qr-code';
import HomeHeader from '@components/home-header';
import Header from '@components/header';
import { get } from '@common/utils/get';
import Protocol from '../components/protocol';
import { BANNED_USER, REVIEWING, REVIEW_REJECT, isExtFieldsOpen } from '@common/store/login/util';
import PcBodyWrap from '../components/pc-body-wrap';
import { genMiniScheme } from '@common/server';
import { MOBILE_LOGIN_STORE_ERRORS } from '@common/store/login/mobile-login-store';

@inject('site')
@inject('user')
@inject('h5QrCode')
@inject('commonLogin')
@inject('invite')
@observer
class WXLoginH5Page extends React.Component {

  timer = null;
  isDestroy = false;

  async componentDidMount() {
    await this.generateQrCode();
  }

  componentWillUnmount() {
    this.isDestroy = true;
    clearInterval(this.timer);
  }

  async generateQrCode() {
    try {
      const { site, invite, router, h5QrCode } = this.props;

      if (site?.wechatEnv === 'none') return;

      const { platform } = site;

      let inviteCode = invite.getInviteCode(router);
      if (inviteCode) inviteCode = `&inviteCode=${inviteCode}`;

      if (platform === 'h5' && site?.isMiniProgramOpen) {
        // 在h5 浏览器中 且小程序设置打开 通过小程序schema跳转
        const resp = await genMiniScheme();
        if (resp.code === 0) {
          window.location.href = `${get(resp, 'data.openLink', '')}${inviteCode}`;
          return;
        }
        Toast.error({
          content: '当前小程序不可使用，请联系管理人员切换成公众号模式',
          hasMask: false,
          duration: 3000,
        });
        return;
      }

      // 在h5浏览器中，且公众号设置打开
      const params = {
        type: 'mobile_browser_login',
        redirectUri: encodeURIComponent(`${window.location.origin}/user/${platform === 'h5' ? 'wx-auth' : 'wx-authorization'}?type=${platform}${inviteCode}`),
      };

      // pc端打开
      if (platform === 'pc') {
        // 开启小程序登陆
        if (site?.isMiniProgramOpen) {
          params.type = 'pc_login_mini';
          params.redirectUri = undefined; // 无需传入redirectUri
        } else {
          params.type = 'pc_login';
        }
      }

      await h5QrCode.generate({ params });
      // 组件销毁后，不执行后面的逻辑
      if (this.isDestroy) {
        return;
      }
      if (platform === 'pc') {
        this.queryLoginState(params.type);
      } else {
        setTimeout(() => {
          this.props.h5QrCode.countDown = 0;
        }, this.props.h5QrCode.countDownOfSeconds * 1000);
      }
    } catch (e) {
      console.log(e);
      Toast.error({
        content: e.Message || e,
        hasMask: false,
        duration: 1000,
      });
    }
  }

  queryLoginState(type) {
    this.timer = setInterval(async () => {
      try {
        const res = await this.props.h5QrCode.login({
          type,
          params: { sessionToken: this.props.h5QrCode.sessionToken },
        });
        clearInterval(this.timer);
        const uid = get(res, 'data.uid');
        this.props.user.updateUserInfo(uid);
        // FIXME: 使用 window 跳转用来解决，获取 forum 在登录前后不同的问题，后续需要修改 store 完成
        window.location.href = '/';
      } catch (e) {
        // 从store中提取最长轮询时间，到期后终止轮询，并提示刷新二维码
        if (this.props.h5QrCode.countDown > 0) {
          this.props.h5QrCode.countDown = this.props.h5QrCode.countDown - 3;
        } else {
          clearInterval(this.timer);
        }

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
          const uid = get(e, 'uid', '');
          uid && this.props.user.updateUserInfo(uid);
          if (isExtFieldsOpen(site)) {
            this.props.commonLogin.needToCompleteExtraInfo = true;
            this.props.router.replace('/user/supplementary');
            return;
          }
          return window.location.href = '/';
        }
        // 跳转状态页
        if (e.Code === BANNED_USER || e.Code === REVIEWING || e.Code === REVIEW_REJECT) {
          const uid = get(e, 'uid', '');
          uid && this.props.user.updateUserInfo(uid);
          this.props.commonLogin.setStatusMessage(e.Code, e.Message);
          this.props.router.replace(`/user/status?statusCode=${e.Code}&statusMsg=${e.Message}`);
        }
      }
    }, 3000);
  }

  getOrCodeTips = () => {
    const { site: { platform, wechatEnv } } = this.props;
    let orCodeTips = '';
    switch (platform) {
      case 'pc':
        orCodeTips = '请使用微信，扫码登录';
        break;
      case 'h5':
        if (wechatEnv === 'miniProgram') {
          orCodeTips = '请在小程序中完成站点登录';
          break;
        }
        orCodeTips = '长按保存二维码，并在微信中识别此二维码，即可完成登录';
        break;
    }
    return orCodeTips;
  }

  render() {
    const { site, commonLogin } = this.props;
    const { platform } = site;
    const isAnotherLoginWayAvaliable = this.props.site.isSmsOpen || this.props.site.isUserLoginVisible;
    // 接受监听一下协议的数据，不能去掉，去掉后协议的点击无反应
    const { protocolVisible } = commonLogin;
    return (
      <PcBodyWrap>
      <div className={platform === 'h5' ? layout.container : layout.pc_container}>
        {
          platform === 'h5'
            ? <HomeHeader hideInfo mode='login'/>
            : null
        }
        <div className={platform === 'h5' ? layout.content : layout.pc_content}>
          <div className={platform === 'h5' ? layout.title : layout.pc_title}>微信登录</div>
          {/* 二维码 start */}
          <WeixinQrCode
            refresh={() => {this.generateQrCode()}}
            isValid={this.props.h5QrCode.isQrCodeValid}
            orCodeImg={this.props.h5QrCode.qrCode}
            orCodeTips={this.getOrCodeTips()}
          />
          {/* 二维码 end */}
          {isAnotherLoginWayAvaliable && <div className={platform === 'h5' ? layout['otherLogin-title'] : layout.pc_otherLogin_title}>其他登录方式</div>}
          <div className={platform === 'h5' ? layout['otherLogin-button'] : layout.pc_otherLogin_button}>
            {this.props.site.isUserLoginVisible && (
              <span
                onClick={() => {
                  this.props.router.replace('/user/username-login');
                }}
                className={platform === 'h5' ? layout['otherLogin-button-weixin'] : layout.button_left}
              >
                <Icon size={20} name='UserOutlined' color='#4084FF'/>
              </span>
            )}
            {this.props.site.isSmsOpen && (
              <span
                onClick={() => {
                  this.props.router.replace('/user/phone-login');
                }}
                className={platform === 'h5' ? layout['otherLogin-button-user'] : layout.button_right}
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

export default withRouter(WXLoginH5Page);
