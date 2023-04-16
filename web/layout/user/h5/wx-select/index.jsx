import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import layout from './index.module.scss';
import { Button, Toast, Avatar, Icon } from '@discuzqsdk/design';
import HomeHeader from '@components/home-header';
import { get } from '@common/utils/get';
import setAccessToken from '../../../../../common/utils/set-access-token';
import { BANNED_USER, REVIEWING, REVIEW_REJECT, checkUserStatus } from '@common/store/login/util';
import { usernameAutoBind } from '@server';
import { MOBILE_LOGIN_STORE_ERRORS } from '@common/store/login/mobile-login-store';
import { isExtFieldsOpen } from '@common/store/login/util';

@inject('site')
@inject('user')
@inject('commonLogin')
@inject('invite')
@observer
class WXSelectH5Page extends React.Component {
  render() {
    const { router, invite, commonLogin } = this.props;
    const { sessionToken, nickname, avatarUrl } = router.query;
    return (
      <div className={layout.container}>
        <HomeHeader hideInfo mode='login'/>
        <div className={layout.content}>
          <div className={layout.title}>微信绑定</div>
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
            请选择您要进行的操作
          </div>
          <Button
            className={`${layout.button} ${layout.btn_select} ${layout.btn_wx}`}
            type="primary"
            onClick={async () => {
              const inviteCode = invite.getInviteCode(router);
              try {
                if (!commonLogin.loginLoading) {
                  return;
                }
                commonLogin.loginLoading = false;
                const res = await usernameAutoBind({
                  timeout: 10000,
                  params: {
                    sessionToken,
                    type: 0, // 公众号0 (默认)， 小程序1，临时方案，测试环境的公众号/小程序没有关联起来
                    inviteCode,
                  },
                });
                commonLogin.loginLoading = true;
                checkUserStatus(res);
                if (res.code === 0) {
                  const accessToken = get(res, 'data.accessToken', '');
                  const uid = get(res, 'data.uid', '');
                  // 种下 access_token
                  setAccessToken({
                    accessToken,
                  });
                  this.props.user.updateUserInfo(uid);
                  Toast.success({
                    content: '登录成功',
                    duration: 1000,
                    onClose: () => {
                      window.location.href = '/';
                    }
                  });
                  return;
                }
                throw {
                  Code: res.code,
                  Message: res.msg,
                };
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
                  content: error.Message || '网络错误',
                });
                throw {
                  Code: 'ulg_9999',
                  Message: '网络错误',
                  error,
                };
              }
            }}
          >
            <Icon name='WeChatOutlinedThick' size={16}/>
            微信登录
          </Button>
          {this.props.site.isUserLoginVisible && (
            <Button
              className={`${layout.button} ${layout.btn_select} ${layout.btn_user}`}
              type="primary"
              onClick={() => {
                router.push({ pathname: 'wx-bind-username', query: { sessionToken, nickname, avatarUrl } });
              }}
            >
              <Icon name='UserOutlined' size={16}/>
              绑定已有用户名
            </Button>
          )}
          {this.props.site.isSmsOpen && (
            <Button
              className={`${layout.button} ${layout.btn_select} ${layout.btn_phone}`}
              type="primary"
              onClick={() => {
                router.push({ pathname: 'wx-bind-phone', query: { sessionToken, nickname, avatarUrl } });
              }}
            >
              <Icon name='PhoneOutlined' size={16}/>
              绑定手机号
            </Button>
          )}
        </div>
      </div>
    );
  }
}

export default withRouter(WXSelectH5Page);
