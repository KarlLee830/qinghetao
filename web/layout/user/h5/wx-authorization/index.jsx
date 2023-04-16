import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import layout from './index.module.scss';
import HomeHeader from '@components/home-header';
import { Button, Toast } from '@discuzqsdk/design';
import { h5WechatCodeLogin } from '@server';
import setAccessToken from '@common/utils/set-access-token';
import { get } from '@common/utils/get';
import { checkUserStatus } from '@common/store/login/util';

const NEED_BIND_OR_REGISTER_USER = -7016;
let bindLoading = false;
@inject('site')
@inject('user')
@inject('h5QrCode')
@inject('commonLogin')
@inject('invite')
@observer
class WXAuthorizationPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginTitle: `你确定要授权登录${props.site.siteName}吗？`
    }
  }

  render() {
    return (
      <div className={layout.container}>
        <HomeHeader hideInfo mode='login'/>
        <div className={layout.content}>
          <div className={layout.title}>{this.state.loginTitle}</div>
          {
            this.props.h5QrCode.isBtn
              ? <>
                  <Button
                    className={layout.button}
                    type="primary"
                    onClick={this.authorization}
                  >
                    确定
                  </Button>
                </>
              : <></>
          }
          <Button
            className={layout.exit}
            onClick={() => {
              this.setState({
                loginTitle: '已取消登录'
              });
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

  authorization = async () => {
    const { router, invite } = this.props;
    const { code, sessionId, sessionToken, state, type } = router.query;
    try {
      if (bindLoading) {
        return;
      }
      bindLoading = true;
      const res = await h5WechatCodeLogin({
        timeout: 10000,
        params: {
          code,
          sessionId,
          sessionToken,
          state,
          inviteCode: invite.getInviteCode(router),
        },
      });
      bindLoading = false;

      // 落地页开关打开
      if (res.code === NEED_BIND_OR_REGISTER_USER) {
        const { sessionToken, nickname } = res.data;
        router.push({ pathname: 'wx-select', query: { sessionToken, nickname } });
        return;
      }

      if (res.code === 0 && type === 'h5') {
        const accessToken = get(res, 'data.accessToken');
        const uid = get(res, 'data.uid');
        // 注册成功后，默认登录
        setAccessToken({
          accessToken,
        });
        this.props.user.updateUserInfo(uid);
        window.location.href = '/';
        return;
      }
      if (res.code === 0) {
        this.setState({
          loginTitle: '已成功登录'
        });
        this.props.h5QrCode.isBtn = false;
        return;
      }
      checkUserStatus(res);
      throw {
        Code: res.code,
        Message: res.msg,
      };
    } catch (error) {
      bindLoading = false;
      this.setState({
        loginTitle: '登录失败，请刷新二维码重新扫码'
      });
      this.props.h5QrCode.isBtn = false;
      Toast.error({
        content: error.Message,
      });
      throw {
        Code: 'ulg_9999',
        Message: '网络错误',
        error,
      };
    }
  }
}

export default withRouter(WXAuthorizationPage);
