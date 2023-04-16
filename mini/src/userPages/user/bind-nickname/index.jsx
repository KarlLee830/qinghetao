import React from 'react';
import { inject, observer } from 'mobx-react';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Input from '@discuzqsdk/design/dist/components/input/index';
import { View } from '@tarojs/components';
import layout from './index.module.scss';
import HomeHeader from '@components/home-header';
import Header from '@components/header';
import clearLoginStatus from '@common/utils/clear-login-status';
import { get } from '@common/utils/get';
import { BANNED_USER, REVIEWING, REVIEW_REJECT, isExtFieldsOpen } from '@common/store/login/util';
import LoginHelper from '@common/utils/login-helper';
import Router from '@discuzqsdk/sdk/dist/router';
import Page from '@components/page';

@inject('site')
@inject('user')
@inject('thread')
@inject('commonLogin')
@inject('nicknameBind')
@observer
class BindNicknameH5Page extends React.Component {
  handleNicknameChange = (e) => {
    this.props.nicknameBind.nickname = e.target.value;
  };

  componentWillUnmount() {
    this.props.nicknameBind.nickname = '';
  }

  handleBindButtonClick = async () => {
    try {
      const { commonLogin } = this.props;
      if (!commonLogin.loginLoading) {
        return;
      }
      commonLogin.loginLoading = false;
      await this.props.nicknameBind.bindNickname();
      commonLogin.needToSetNickname = false;
      commonLogin.loginLoading = true;
      Toast.success({
        content: '昵称设置成功',
        hasMask: false,
        duration: 1000,
        onClose: () => {
          const { site, commonLogin } = this.props;
          const { statusCode, statusMsg, needToCompleteExtraInfo, needToBindPhone, needToBindWechat, nickName, sessionToken } = commonLogin;
          // 跳转补充信息页
          if (needToCompleteExtraInfo) {
            if (isExtFieldsOpen(site)) {
              commonLogin.needToCompleteExtraInfo = true;
              Router.redirect({
                url: '/userPages/user/supplementary/index'
              });
              return;
            }
          }

          if (needToBindPhone) {
            return Router.redirect({
              url: `/userPages/user/bind-phone/index?sessionToken=${sessionToken}`
            });
          }
          if (needToBindWechat === true) {
            return Router.redirect({
              url: `/userPages/user/wx-bind/index`
            });
          }
          if (statusMsg && statusCode) {
            return Router.redirect({
              url: `/userPages/user/status/index?statusCode=${statusCode}&statusMsg=${statusMsg}`
            });
          }

          LoginHelper.restore();
        },
      });
    } catch (e) {
      this.props.commonLogin.loginLoading = true;
      // 跳转状态页
      if ([BANNED_USER, REVIEWING, REVIEW_REJECT].includes(e.Code)) {
        const uid = get(e, 'uid', '');
        uid && this.props.user.updateUserInfo(uid);
        this.props.commonLogin.setStatusMessage(e.Code, e.Message);

        Router.redirect({
          url: `/userPages/user/status/index?statusCode=${e.Code}&statusMsg=${e.Message}`
        })
        return;
      }
      Toast.error({
        content: e.Message,
        hasMask: false,
        duration: 1000,
      });
    }
  };

  logout = () => {
    clearLoginStatus();
    LoginHelper.clear();

    const siteMode = this.props.site?.webConfig?.setSite?.siteMode;
    const url = siteMode === 'pay' ? '/subPages/forum/partner-invite/index' : '/indexPages/home/index';

    Router.reLaunch({
      url,
      complete: () => {
        setTimeout(() => {
          this.props.user.removeUserInfo();
          this.props.site.getSiteInfo();
        }, 300);
      }
    });
  };

  render() {
    const { site, nicknameBind, commonLogin: { loginLoading } } = this.props;
    return (
      <Page>
        <View className={layout.container}>
          <HomeHeader hideInfo hideMinibar mode="supplementary"/>
          <View className={layout.content}>
            <View className={layout.title}>设置昵称</View>
            <Input
              className={layout.input}
              value={nicknameBind.nickname}
              placeholder="昵称"
              clearable={true}
              onChange={this.handleNicknameChange}
              onEnter={this.handleBindButtonClick}
            />
            <Button
              disabled={!nicknameBind.nickname}
              loading={!loginLoading}
              className={layout.button}
              type="primary"
              onClick={this.handleBindButtonClick}
            >
              下一步
            </Button>
            <View className={layout.functionalRegion}>
              <View className={layout.clickBtn} onClick={() => { this.logout() }}>
                退出登录
              </View>
            </View>
          </View>
        </View>
      </Page>
    );
  }
}

export default BindNicknameH5Page;
