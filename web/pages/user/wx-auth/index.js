import React from 'react';
import { inject } from 'mobx-react';
import { Toast } from '@discuzqsdk/design';
import { h5WechatCodeLogin } from '@server';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCLoginMode from '@middleware/HOCLoginMode';
import { get } from '@common/utils/get';
import ViewAdapter from '@components/view-adapter';
import setAccessToken from '../../../../common/utils/set-access-token';
import { BANNED_USER, REVIEWING, REVIEW_REJECT, checkUserStatus, isExtFieldsOpen } from '@common/store/login/util';
import { MOBILE_LOGIN_STORE_ERRORS } from '@common/store/login/mobile-login-store';

const NEED_BIND_OR_REGISTER_USER = -7016;
@inject('site')
@inject('user')
@inject('commonLogin')
@inject('invite')
class WeixinAuth extends React.Component {
  async componentDidMount() {
    const { router, invite } = this.props;
    const { code, sessionId, sessionToken, state, loginType, action, nickname = '', bindPhone = '', toPage = '' } = router.query;

    // 如果要进行绑定逻辑，跳转绑定相关的页面
    if (action === 'wx-bind') {
      window.location.href = `/user/wx-bind?code=${code}&sessionId=${sessionId}&sessionToken=${sessionToken}&state=${state}&nickname=${nickname}&loginType=${loginType}&bindPhone=${bindPhone}&toPage=${toPage}`;
      return;
    }

    const inviteCode = invite.getInviteCode(router);
    if (inviteCode) invite.setInviteCode(inviteCode);

    try {
      this.target = Toast.loading({
        content: '微信登录中...',
        duration: 0,
      });
      const res = await h5WechatCodeLogin({
        timeout: 10000,
        params: {
          code,
          sessionId,
          sessionToken,
          state,
          inviteCode,
        },
      });
      checkUserStatus(res);

      // 落地页开关打开
      if (res.code === NEED_BIND_OR_REGISTER_USER) {
        const { sessionToken, nickname } = res.data;
        window.location.href = `/user/wx-select?sessionToken=${sessionToken}&nickname=${nickname}`;
        return;
      }

      if (res.code === 0) {
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

      throw {
        Code: res.code,
        Message: res.msg,
      };
    } catch (error) {
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
        window.location.href = `/user/status?statusCode=${error.Code}&statusMsg=${error.Message}`;
        return;
      }
      if (error.Code) {
        Toast.error({
          content: error.Message,
        });
      }
      throw {
        Code: 'ulg_9999',
        Message: '网络错误',
        error,
      };
    }
  }
  componentWillUnmount() {
    this?.target?.hide();
  }


  render() {
    return <ViewAdapter
              h5={<></>}
              pc={<></>}
              title={`登录`}
            />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(HOCLoginMode('weixin')(WeixinAuth));
