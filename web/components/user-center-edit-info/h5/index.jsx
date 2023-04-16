import React, { Component } from 'react';
import UserCenterEditHeader from '../../user-center-edit-header/index';
import { Button, Icon, Input, Toast, Spin } from '@discuzqsdk/design';
import styles from './index.module.scss';
import Avatar from '@components/avatar';
import { inject, observer } from 'mobx-react';
import Router from '@discuzqsdk/sdk/dist/router';
import throttle from '@common/utils/thottle.js';
import { isExtFieldsOpen } from '@common/store/login/util';
import Copyright from '@components/copyright';

@inject('site')
@inject('user')
@observer
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isClickNickName: false,
      isConfirm: false, // 是否点击保存
    };
    this.user = this.props.user || {};
  }

  initState = () => {
    this.setState({
      isClickNickName: false,
      isConfirm: false,
    });
  };

  async componentDidMount() {
    this.initState();
    const id = this.props.user?.id;
    await this.props.user.updateUserInfo(id);
    await this.props.user.initEditInfo();
  }

  // 点击取消
  handleCancel = throttle(() => {
    Router.back();
    this.props.user.initEditInfo();
    this.initState();
  }, 300);

  handleClickNickName = () => {
    this.setState({
      isClickNickName: !this.state.isClickNickName,
    });
  };

  handleChangeNickName = (e) => {
    const { value } = e.target;
    this.props.user.editNickName = value;
  };

  handleBlurNickName = (e) => {
    const { value } = e.target;
    this.props.user.editNickName = value;
    this.setState({
      isClickNickName: false,
    });
  };

  // 渲染修改用户名
  renderInputNickName = () => {
    const { isClickNickName } = this.state;
    return (
      <>
        <label className={styles.userLabelName}>昵称</label>
        <div className={styles.uerInputItem}>
          {isClickNickName ? (
            <Input
              focus={true}
              maxLength={10}
              value={this.user.editNickName}
              onChange={this.handleChangeNickName}
              onBlur={this.handleBlurNickName}
            />
          ) : (
            this.user.editNickName
          )}
        </div>
      </>
    );
  };

  handleUpdateEditedUserInfo = throttle(() => {
    if (this.state.isConfirm) return;
    this.setState({
      isConfirm: true,
    });
    this.props.user
      .updateEditedUserInfo()
      .then((res) => {
        Toast.success({
          content: '更新信息成功',
          hasMask: false,
          duration: 2000,
        });
        Router.push({ url: '/my' });
      })
      .catch((error) => {
        Toast.error({
          content: error.Message || '更新用户信息失败',
          hasMask: false,
          duration: 2000,
        });
        Router.push({ url: '/my' });
      });
  }, 300);

  handleGoToEditMobile = () => {
    if (!this.user.mobile) {
      Router.push({ url: '/user/bind-phone' });
      return;
    }
    Router.push({ url: '/my/edit/mobile' });
  };

  handleGoToEditUserName = () => {
    if (!this.props.user.canEditUsername) {
      Toast.error({
        content: '暂无法修改（一年一次）',
        duration: 2000,
      });
      return;
    }
    Router.push({ url: '/my/edit/username' });
  };

  handleGoToEditAccountPwd = () => {
    Router.push({ url: '/my/edit/pwd' });
  };

  handleGoToEditPayPwd = () => {
    Router.push({ url: '/my/edit/paypwd' });
  };

  handleGoToAdditionalInfo = () => {
    Router.push({ url: '/my/edit/additional-info' });
  };

  render() {
    const { isConfirm } = this.state;
    const { user, site } = this.props;
    // 条件都满足时才显示微信
    const IS_WECHAT_ACCESSABLE = this.props.site.wechatEnv !== 'none';
    const IS_WECHAT_HAS_BIND = Boolean(this.user.wxNickname);
    const ISEXT_FIELD_OPENS = isExtFieldsOpen(this.props?.site);
    return (
      <div id={styles.editInfoWrapper}>
        <div className={styles.mainContent}>
          <div>
            {/* 头部 */}
            <div>
              <UserCenterEditHeader />
            </div>
            {/* middle */}
            <div className={styles.userCenterEditMiddle}>
              <h3>个人信息</h3>
              <div onClick={this.handleClickNickName} className={styles.userInputContent}>
                {this.renderInputNickName()}
              </div>
              <div className={styles.userCenterEditItem}>
                <div className={styles.userCenterEditLabel}>
                  <label className={styles.userLabelName}>用户名</label>
                  <div className={styles.userCenterEditValue} onClick={this.handleGoToEditUserName}>
                    <div className={styles.ucText}>{this.user.username}</div>
                    <Icon name="RightOutlined" />
                  </div>
                </div>
              </div>
              {this.props.site?.isSmsOpen && (
                <div className={styles.userCenterEditItem}>
                  <div className={styles.userCenterEditLabel}>
                    <label className={styles.userLabelName}>手机号码</label>
                  </div>
                  <div className={styles.userCenterEditValue} onClick={this.handleGoToEditMobile}>
                    <div className={styles.ucText}>{this.user.mobile || '去绑定'}</div>
                    <Icon name="RightOutlined" />
                  </div>
                </div>
              )}
              <div className={styles.userCenterEditItem}>
                <div className={styles.userCenterEditLabel}>
                  <label className={styles.userLabelName}>账户密码</label>
                </div>
                <div className={styles.userCenterEditValue} onClick={this.handleGoToEditAccountPwd}>
                  <div className={styles.ucText}>{this.props.user?.hasPassword ? '修改' : '设置'}</div>
                  <Icon name="RightOutlined" />
                </div>
              </div>
              <div className={styles.userCenterEditItem}>
                <div className={styles.userCenterEditLabel}>
                  <label className={styles.userLabelName}>支付密码</label>
                </div>
                <div className={styles.userCenterEditValue} onClick={this.handleGoToEditPayPwd}>
                  <div className={styles.ucText}>{this.props.user?.canWalletPay ? '修改' : '设置'}</div>
                  <Icon name="RightOutlined" />
                </div>
              </div>
              {IS_WECHAT_ACCESSABLE && (
                <div className={styles.userCenterEditItem}>
                  <div className={styles.userCenterEditLabel}>
                    <label className={styles.userLabelName}>微信</label>
                    <div className={styles.userCenterEditWeChat}>
                      {IS_WECHAT_HAS_BIND && (
                        <Avatar size="small" image={this.user.wxHeadImgUrl} name={this.user.wxNickname} />
                      )}
                      {IS_WECHAT_HAS_BIND ? <span className={styles.wxNickname}>{this.user.wxNickname}</span> : '未绑定'}
                      {IS_WECHAT_HAS_BIND && (
                        <div
                          className={styles.linkText}
                          onClick={() => {
                            Router.push({ url: '/user/rebind' });
                          }}
                        >
                          换绑
                        </div>
                      )}
                      {!IS_WECHAT_HAS_BIND && (
                        <div
                          className={styles.linkText}
                          onClick={() => {
                            Router.push({ url: '/user/wx-bind-qrcode' });
                          }}
                        >
                          绑定微信
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {ISEXT_FIELD_OPENS && (
                <div className={styles.userCenterEditItem} onClick={this.handleGoToAdditionalInfo}>
                  <div className={styles.userCenterEditLabel}>
                    <label className={styles.userLabelName}>补充信息</label>
                  </div>
                  <div className={styles.userCenterEditValue}>
                    <Icon name="RightOutlined" size={12} />
                  </div>
                </div>
              )}
            </div>
            {/* bottom */}
            {/* <div className={styles.userCenterEditBottom}> */}
            {/* <h3>实名认证</h3>
            <div className={styles.userCenterEditItem}>
              <div className={styles.userCenterEditLabel}>
                <label>申请实名认证</label>
                <div>去认证</div>
              </div>
              <div><Icon name="RightOutlined" /></div>
            </div> */}
            {/* </div> */}
          </div>
          <Copyright />
        </div>
        <div className={styles.userCenterEditBtn}>
          <Button full onClick={this.handleCancel} className={styles.btn}>
            取消
          </Button>
          <Button className={styles.btn} disabled={isConfirm} full onClick={this.handleUpdateEditedUserInfo} type="primary">
            {isConfirm ? <Spin type="spinner">保存中...</Spin> : '保存'}
          </Button>
        </div>
      </div>
    );
  }
}

export default index;
