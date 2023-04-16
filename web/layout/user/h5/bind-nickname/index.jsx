import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import { Button, Input, Toast } from '@discuzqsdk/design';
import layout from './index.module.scss';
import HomeHeader from '@components/home-header';
import Header from '@components/header';
import clearLoginStatus from '@common/utils/clear-login-status';
import { get } from '@common/utils/get';
import PcBodyWrap from '../components/pc-body-wrap';
import { BANNED_USER, REVIEWING, REVIEW_REJECT, isExtFieldsOpen } from '@common/store/login/util';

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
          const { router, site, platform } = this.props;
          const { needToCompleteExtraInfo: isNeedToCompleteExtraInfo } = router.query;
          // 扩展信息的判断跳转
          const needToCompleteExtraInfo = commonLogin.needToCompleteExtraInfo || isNeedToCompleteExtraInfo;

          // 跳转补充信息页
          if (needToCompleteExtraInfo) {
            if (isExtFieldsOpen(site)) {
              commonLogin.needToCompleteExtraInfo = true;
              // this.props.router.push('/user/supplementary')
              window.location.href = '/user/supplementary';  // this.props.router.push 无法跳转
              return;
            }
            return window.location.href = '/';
          }

          const { statusCode, statusMsg, needToBindPhone,
            needToBindWechat, nickName, sessionToken } = commonLogin;

          if (needToBindPhone) {
            return this.props.router.push(`/user/bind-phone?sessionToken=${sessionToken}`);
          }

          if (needToBindWechat === true) {
            return this.props.router.push(`/user/wx-bind-qrcode?sessionToken=${sessionToken}&loginType=${platform}&nickname=${nickName}&isSkip=${true}`);
          }
          if (statusMsg && statusCode) {
            return this.props.router.push(`/user/status?statusCode=${statusCode}&statusMsg=${statusMsg}`);
          }
          window.location.href = '/';
        },
      });
    } catch (e) {
      this.props.commonLogin.loginLoading = true;
      // 跳转状态页
      if ([BANNED_USER, REVIEWING, REVIEW_REJECT].includes(e.Code)) {
        const uid = get(e, 'uid', '');
        uid && this.props.user.updateUserInfo(uid);
        this.props.commonLogin.setStatusMessage(e.Code, e.Message);
        this.props.router.push(`/user/status?statusCode=${e.Code}&statusMsg=${e.Message}`);
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
    const { site, nicknameBind, commonLogin: { loginLoading } } = this.props;
    const { platform } = site;
    return (
      <PcBodyWrap>
      <div className={platform === 'h5' ? layout.container : layout.pc_container}>
        {
          platform === 'h5'
            ? <HomeHeader hideInfo mode='login'/>
            : null
        }
        <div className={platform === 'h5' ? layout.content : layout.pc_content}>
          <div className={platform === 'h5' ? layout.title : layout.pc_title}>设置昵称</div>
          <Input
            className={platform === 'h5' ? layout.input : layout.pc_input}
            value={nicknameBind.nickname}
            placeholder="昵称"
            clearable={true}
            onChange={this.handleNicknameChange}
            onEnter={this.handleBindButtonClick}
          />
          <Button
            disabled={!nicknameBind.nickname}
            loading={!loginLoading}
            className={platform === 'h5' ? layout.button : layout.pc_button}
            type="primary"
            onClick={this.handleBindButtonClick}
          >
            下一步
          </Button>
          <div className={platform === 'h5' ? layout.functionalRegion : layout.pc_functionalRegion}>
            <span className={layout.clickBtn} onClick={() => {
              clearLoginStatus(); // 清除登录态
              window.location.replace('/');
            }}>
              退出登录
            </span>
          </div>
        </div>
      </div>
      </PcBodyWrap>
    );
  }
}

export default withRouter(BindNicknameH5Page);
