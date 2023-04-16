import React, { Component } from 'react';
import { getCurrentInstance, navigateTo, redirectTo } from '@tarojs/taro';
import { View } from '@tarojs/components';
import { observer, inject } from 'mobx-react';
import Input from '@discuzqsdk/design/dist/components/input/index';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Avatar from '@discuzqsdk/design/dist/components/avatar/index';
// import { ToastProvider } from '@discuzqsdk/design/dist/components/toast/ToastProvider';
import Page from '@components/page';
import { get } from '@common/utils/get';
import { BANNED_USER, REVIEWING, REVIEW_REJECT, isExtFieldsOpen } from '@common/store/login/util';
import layout from './index.module.scss';
import { MOBILE_LOGIN_STORE_ERRORS } from '@common/store/login/mobile-login-store';
import LoginHelper from '@common/utils/login-helper';
// const MemoToastProvider = React.memo(ToastProvider)

@inject('site')
@inject('user')
@inject('userLogin')
@inject('commonLogin')
@observer
class Index extends Component {
  componentWillUnmount() {
    this.props.userLogin.reset();
    this.props.commonLogin.reset();
  }

  handleBindButtonClick = async () => {
    try {
      const { commonLogin } = this.props;
      if (!commonLogin.loginLoading) {
        return;
      }
      commonLogin.setLoginLoading(false);
      const resp = await this.props.userLogin.login();
      const uid = get(resp, 'data.uid', '');
      this.props.user.updateUserInfo(uid);
      commonLogin.setLoginLoading(true);
      Toast.success({
        content: '登录成功',
        hasMask: false,
        duration: 1000,
        onClose: () => {
          LoginHelper.restore();
        }
      });
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
        duration: 1000,
      });
    }
  };

  render() {
    const { userLogin, commonLogin } = this.props;
    const { nickname, sessionToken } = getCurrentInstance().router.params;
    userLogin.sessionToken = sessionToken;

    return (
      <Page>
        {/* <MemoToastProvider> */}
        <View className={layout.container}>
          <View className={layout.content}>
            <View className={layout.title}>用户名登录，并绑定微信账号</View>
            <View className={layout.tips}>
              <View style={{display: 'flex' }}>hi， 微信用户<Avatar style={{margin: '0 8px'}} circle size='small' image={commonLogin.avatarUrl}/>{nickname}</View>
              <View>请您登录，即可完成微信号和用户名的绑定</View>
            </View>
            {/* 输入框 start */}
            <Input
              clearable
              className={layout.input}
              value={userLogin.username}
              placeholder="输入您的用户名"
              onChange={(e) => {
                userLogin.username = e.target.value;
              }}
            />
            <Input
              className={layout.input}
              mode="password"
              value={userLogin.password}
              placeholder="输入您的登录密码"
              onChange={(e) => {
                userLogin.password = e.target.value;
              }}
            />
            {/* 输入框 end */}
            {/* 登录按钮 start */}
            <Button className={layout.button} loading={!commonLogin.loginLoading} type="primary" onClick={this.handleBindButtonClick}>
              登录并绑定
            </Button>
            {/* 登录按钮 end */}
          </View>
        </View>
        {/* </MemoToastProvider> */}
      </Page>
    );
  }
}

export default Index;
