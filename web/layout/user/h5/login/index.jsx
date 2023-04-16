import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import isWeiXin from '@common/utils/is-weixin';
import { Toast } from '@discuzqsdk/design';
import clearLoginStatus from '@common/utils/clear-login-status';
import { BANNED_USER, REVIEWING, REVIEW_REJECT } from '@common/store/login/util';

/** *
    根据目前的登录模式设置默认的登录页面
 ***/


@inject('site')
@inject('invite')
@inject('commonLogin')
@observer
class Login extends React.Component {
  componentDidMount() {
    const { site, invite, router } = this.props;
    this.target = Toast.loading({
      duration: 0,
    });

    if (site.wechatEnv !== 'none') {
      if (isWeiXin() && site?.isOffiaccountOpen) {
        let inviteCode = invite.getInviteCode(router);
        if (inviteCode) inviteCode = `?inviteCode=${inviteCode}`;
        const redirectEncodeUrl = encodeURIComponent(`${window.location.origin}/user/wx-auth${inviteCode}`);
        window.location.href = `${window.location.origin}/api/v3/users/wechat/h5.oauth?redirect=${redirectEncodeUrl}`;
        return;
      }
      router.replace('/user/wx-login');
      return;
    }

    if (site.isSmsOpen) {
      router.replace('/user/phone-login');
      return;
    }

    router.replace('/user/username-login');
  }

  componentWillUnmount() {
    setTimeout(() => {
      this?.target?.hide();
    }, 50);
  }

  render() {
    return null;
  }
}

export default withRouter(Login);
