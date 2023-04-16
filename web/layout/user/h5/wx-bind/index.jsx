import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import layout from './index.module.scss';
import HomeHeader from '@components/home-header';
import { Button, Toast } from '@discuzqsdk/design';
import { h5WechatCodeBind } from '@server';
import { BANNED_USER, REVIEWING, REVIEW_REJECT, checkUserStatus } from '@common/store/login/util';
import setAccessToken from '@common/utils/set-access-token';
import { get } from '@common/utils/get';
import { MOBILE_LOGIN_STORE_ERRORS } from '@common/store/login/mobile-login-store';
import { isExtFieldsOpen } from '@common/store/login/util';
import loginHelper from '@common/utils/login-helper';

let bindLoading = false;
const NEED_BIND_OR_REGISTER_USER = -7016;

@inject('site')
@inject('user')
@inject('h5QrCode')
@inject('commonLogin')
@observer
class WeixinBindH5Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: ''
    }
  }
  render() {
    const { sessionToken, loginType, code, sessionId, state, nickname = '' }  = this.props.router.query;
    const { site } = this.props;
    const { platform } = site;
    return (
      <div className={layout.container}>
        <HomeHeader hideInfo mode='login'/>
        <div className={layout.content}>
          <div className={layout.title}>绑定微信号</div>
          <div className={layout.tips}>
            {nickname ? `${nickname}，` : ''}{this.props.h5QrCode.bindTitle}
          </div>
          {
            this.props.h5QrCode.isBtn
              ? <>
                <Button
                  className={layout.button}
                  type="primary"
                  onClick={() => this.bind({
                    params: { sessionToken, code, sessionId, type: loginType, state },
                  })}
                >
                  绑定微信，并继续访问
                </Button>
                </>
              : <></>
          }
          <Button
            className={layout.exit}
            onClick={() => {
              this.props.h5QrCode.bindTitle = '已取消绑定';
              this.props.h5QrCode.isBtn = false;
              window.wx && window.wx.ready(() => {
                wx.closeWindow();
              });
            }}>
            退出
          </Button>
        </div>
      </div>
    );
  }

  bind = async (opts) => {
    try {
      if (bindLoading) {
        return;
      }
      const { router } = this.props;
      bindLoading = true;
      const res = await h5WechatCodeBind(opts);
      bindLoading = false;

      // 落地页开关打开
      if (res.code === NEED_BIND_OR_REGISTER_USER) {
        const { sessionToken, nickname } = res.data;
        router.push({ pathname: 'wx-select', query: { sessionToken, nickname } });
        return;
      }
      const { loginType, bindPhone = '', toPage }  = this.props.router.query;
      if (res.code === 0) {
        this.props.h5QrCode.bindTitle = '已成功绑定';
        this.props.h5QrCode.isBtn = false;
        this.setState({
          status: 'success'
        });
      }
      toPage && loginHelper.setUrl(decodeURIComponent(toPage));
      if (res.code === 0 && loginType === 'h5') {
        const accessToken = get(res, 'data.accessToken');
        const uid = get(res, 'data.uid');
        // 注册成功后，默认登录
        setAccessToken({
          accessToken,
        });
        const userData = await this.props.user.updateUserInfo(uid);
        const mobile = get(userData, 'mobile', '');
        if (bindPhone && !mobile) { // 需要绑定手机，但是用户未绑定手机时，跳转到绑定手机页面
          router.replace('/user/bind-phone');
          return;
        }
        this.props.h5QrCode.bindTitle = '已成功绑定，正在跳转到首页';
        loginHelper.restore();
        return;
      }
      if (res.code === 0) {
        return;
      }
      checkUserStatus(res);
      throw {
        Code: res.code,
        Message: res.msg,
      };
    } catch (error) {
      bindLoading = false;
      this.props.h5QrCode.bindTitle = '绑定失败，请刷新二维码重新扫码';
      this.props.h5QrCode.isBtn = false;
      this.setState({
        status: 'error'
      });

      const { site } = this.props;
      // 跳转补充信息页
      if (error.Code === MOBILE_LOGIN_STORE_ERRORS.NEED_COMPLETE_REQUIRED_INFO.Code) {
        if (isExtFieldsOpen(site)) {
          this.props.commonLogin.needToCompleteExtraInfo = true;
          this.props.router.push('/user/supplementary');
          return;
        }
        loginHelper.restore();
      }

      // 跳转状态页
      if (error.Code === BANNED_USER || error.Code === REVIEWING || error.Code === REVIEW_REJECT) {
        const uid = get(error, 'uid', '');
        uid && this.props.user.updateUserInfo(uid);
        this.props.commonLogin.setStatusMessage(error.Code, error.Message);
        this.props.router.push(`/user/status?statusCode=${error.Code}&statusMsg=${error.Message}`);
        return;
      }
      if (error.Code) {
        Toast.error({
          content: error.Message,
        });
        return;
      }
      throw {
        Code: 'ulg_9999',
        Message: '网络错误',
        error,
      };
    }
  }
}

export default withRouter(WeixinBindH5Page);
