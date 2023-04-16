import React, { Component } from 'react';
import { getCurrentInstance, navigateTo, redirectTo  } from '@tarojs/taro';
import { View } from '@tarojs/components';
import { observer, inject } from 'mobx-react';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Avatar from '@discuzqsdk/design/dist/components/avatar/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Page from '@components/page';
import { usernameAutoBind } from '@server';
import setAccessToken from '@common/utils/set-access-token';
import { BANNED_USER, REVIEWING, REVIEW_REJECT, checkUserStatus, isExtFieldsOpen } from '@common/store/login/util';
import { get } from '@common/utils/get';
import layout from './index.module.scss';
import { MOBILE_LOGIN_STORE_ERRORS } from '@common/store/login/mobile-login-store';
import LoginHelper from '@common/utils/login-helper';

const NEED_BIND_PHONE_FLAG = -8001;
@inject('site')
@inject('user')
@inject('commonLogin')
@inject('invite')
@observer
class WXSelect extends Component {
  componentWillMount() { }

  componentDidMount() { }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  handleAutobindCallback = async () => {
    const { sessionToken, inviteCode: inviteCodeFromParams } = getCurrentInstance().router.params;
    const { commonLogin } = this.props;
    try {
      if (!commonLogin.loginLoading) {
        return;
      }
      commonLogin.loginLoading = false;
      const inviteCode = inviteCodeFromParams || this.props.invite.getInviteCode()
      const res = await usernameAutoBind({
        timeout: 10000,
        params: {
          sessionToken,
          type: 0, // 公众号0 (默认)， 小程序1，临时方案，测试环境的公众号/小程序没有关联起来
          inviteCode
        },
      });
      commonLogin.loginLoading = true;

      // @TODO 登录逻辑待重构
      if (res.code === 0) {
        const accessToken = get(res, 'data.accessToken', '');
        const uid = get(res, 'data.uid', '');
        // 种下 access_token
        setAccessToken({
          accessToken,
        });
        this.props.user.updateUserInfo(uid);
      }

      checkUserStatus(res);
      if (res.code === 0) {
        Toast.success({
          content: '登录成功',
          duration: 1000,
          onClose: () => {
            LoginHelper.restore();
          }
        });
        return;
      }

      // 手机号绑定 flag
      if (res.Code === NEED_BIND_PHONE_FLAG) {
        this.props.commonLogin.needToBindPhone = true;
        navigateTo({
          url: `/userPages/user/bind-phone/index?sessionToken=${res.sessionToken}`
        });
        return;
      }
      throw {
        Code: res.code,
        Message: res.msg,
      };
    } catch (error) {
      commonLogin.loginLoading = true;
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
        content: error.Message || '网络错误',
      });
      throw {
        Code: 'ulg_9999',
        Message: '网络错误',
        error,
      };
    }
  }

  render() {
    const { nickname, sessionToken } = getCurrentInstance().router.params;
    const { commonLogin } = this.props;

    return (
      <Page>
        <View className={layout.container}>
          <View className={layout.content}>
            <View className={layout.title}>绑定微信号</View>
            <View className={layout.tips}>
              <View style={{display: 'flex' }}>微信用户<Avatar style={{margin: '0 8px'}} circle size='small' image={commonLogin.avatarUrl}/>{nickname}</View>
              <View>请选择您要进行的操作</View>
            </View>
            <Button
              className={`${layout.button} ${layout.btn_select} ${layout.btn_wx}`}
              type="primary"
              onClick={this.handleAutobindCallback}
            >
              <Icon name='IncreaseOutlined' size={16}/>
              创建新账号
            </Button>
            <Button
              className={`${layout.button} ${layout.btn_select} ${layout.btn_user}`}
              type="primary"
              onClick={() => {
                navigateTo({
                  url: `/userPages/user/wx-bind-username/index?sessionToken=${sessionToken}&nickname=${nickname}`
                })
              }}
            >
              <Icon name='UserOutlined' size={16}/>
              绑定已有用户名
            </Button>
            {this.props.site.isSmsOpen && (
              <Button
                className={`${layout.button} ${layout.btn_select} ${layout.btn_phone}`}
                type="primary"
                onClick={() => {
                  navigateTo({
                    url: `/userPages/user/wx-bind-phone/index?sessionToken=${sessionToken}&nickname=${nickname}`
                  })
                }}
              >
                <Icon name='PhoneOutlined' size={16}/>
                绑定手机号
              </Button>
            )}
          </View>
        </View>
      </Page>
    );
  }
}

export default WXSelect;
