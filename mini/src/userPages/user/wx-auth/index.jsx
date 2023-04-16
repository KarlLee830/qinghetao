import React from 'react';
import { getCurrentInstance } from '@tarojs/taro';
import { inject } from 'mobx-react';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Popup from '@discuzqsdk/design/dist/components/popup/index';
import { Button, View } from '@tarojs/components';
import { miniLogin } from '@server';
import setAccessToken from '@common/utils/set-access-token';
import { BANNED_USER, REVIEWING, REVIEW_REJECT, checkUserStatus, isExtFieldsOpen } from '@common/store/login/util';
import Page from '@components/page';
import { get } from '@common/utils/get';
import { getParamCode, getUserProfile } from '../common/utils'
import layout from './index.module.scss';
import { MOBILE_LOGIN_STORE_ERRORS } from '@common/store/login/mobile-login-store';
import LoginHelper from '@common/utils/login-helper';
import Router from '@discuzqsdk/sdk/dist/router';

const NEED_BIND_OR_REGISTER_USER = -7016;

@inject('site')
@inject('user')
@inject('commonLogin')
@inject('invite')
class MiniAuth extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isVisible: true
    }
    this.handleLoginButtonClick = this.handleLoginButtonClick.bind(this);
  }

  async componentDidMount() {
    const { action, sessionToken } = getCurrentInstance().router.params;
    await getParamCode(this.props.commonLogin);
    // 其他地方跳入的小程序绑定流程
    if(action === 'mini-bind'){
      Router.redirect({
        url: `/userPages/user/wx-bind/index?sessionToken=${sessionToken}`
      })
    }
  }

  componentWillUnmount() {
    this.props.commonLogin.reset();
  }

  getUserProfileCallback = async (params) => {
    let { inviteCode } = getCurrentInstance().router.params;
    inviteCode = inviteCode || this.props.invite.getInviteCode()
    const avatarUrl = params?.userInfo?.avatarUrl;
    const nickName = params?.userInfo?.nickName;
    const { commonLogin } = this.props;
    commonLogin.setAvatarUrl(avatarUrl);
    commonLogin.setNickname(nickName);
    try {
      // 小程序登录
      const resp = await miniLogin({
        timeout: 10000,
        data: {
          jsCode: this.props.commonLogin.jsCode,
          iv: params.iv,
          encryptedData: params.encryptedData,
          inviteCode
        },
      });
      commonLogin.setLoginLoading(true);

      // 优先判断是否能登录
      if (resp.code === 0) {
        const { accessToken, uid } = resp.data;
        setAccessToken({
          accessToken,
        });
        await this.props.user.updateUserInfo(uid);
      }

      // 检查正常登陆后的其它状态码，并重置code
      checkUserStatus(resp);
      if (resp.code === 0) {
        LoginHelper.restore();
        await this.props.site.getSiteInfo();
        return;
      }
      // 落地页开关打开
      if (resp.code === NEED_BIND_OR_REGISTER_USER) {
        const { sessionToken } = resp.data;
        Router.redirect({
          url: `/userPages/user/wx-select/index?sessionToken=${sessionToken}&nickname=${nickName}`
        });
        return;
      }

      throw {
        Code: resp.code,
        Message: resp.msg,
      };
    } catch (error) {
      this.props.commonLogin.setLoginLoading(true);
      await getParamCode(this.props.commonLogin);
      // 补充昵称
      if (error.Code === MOBILE_LOGIN_STORE_ERRORS.NEED_BIND_USERNAME.Code || error.Code === MOBILE_LOGIN_STORE_ERRORS.NEED_ALL_INFO.Code) {
        const uid = get(error, 'uid', '');
        uid && this.props.user.updateUserInfo(uid);

        if (error.Code === MOBILE_LOGIN_STORE_ERRORS.NEED_ALL_INFO.Code) {
          this.props.commonLogin.needToCompleteExtraInfo = true;
        }

        Router.redirect({ url: '/userPages/user/bind-nickname/index' });
        return;
      }

      // 注册信息补充
      if (error.Code === MOBILE_LOGIN_STORE_ERRORS.NEED_COMPLETE_REQUIRED_INFO.Code) {
        const uid = get(error, 'uid', '');
        uid && this.props.user.updateUserInfo(uid);
        if (isExtFieldsOpen(this.props.site)) {
          this.props.commonLogin.needToCompleteExtraInfo = true;
          Router.redirect({ url: '/userPages/user/supplementary/index' });
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
        Router.redirect({
          url: `/userPages/user/status/index?statusCode=${error.Code}&statusMsg=${error.Message}`
        });
        return;
      }
      if (error.Code) {
        Toast.error({
          content: error.Message,
        });
      }
      throw {
        Code: error.Code,
        Message:  error.Message,
        error,
      };
    }
  }

  handleLoginButtonClick() {
    const { commonLogin } = this.props;
    if (!commonLogin.loginLoading) {
      return;
    }
    commonLogin.setLoginLoading(false);
    getUserProfile(this.getUserProfileCallback, true, async () => {
      commonLogin.setLoginLoading(true);
      await getParamCode(this.props.commonLogin);
    });
  }

  render() {
    return (
      <Page>
        <Popup
          position="bottom"
          visible={this.state.isVisible}
        >
          <View  className={layout.modal} >
            <Button className={layout.button} onClick={this.handleLoginButtonClick}>微信快捷登录</Button>
          </View>
        </Popup>
      </Page>
      );
  }
}

export default MiniAuth;
