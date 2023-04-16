import React, { Component } from 'react';
import styles from './index.module.scss';
import { Spin, Input, Icon, Dialog, Toast, Button } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import Router from '@discuzqsdk/sdk/dist/router';
import { trimLR } from '@common/utils/get-trimly.js';
import throttle from '@common/utils/thottle.js';
import classNames from 'classnames';

@inject('site')
@inject('user')
@observer
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSubmit: false, // 是否点击提交
    };
  }

  initState = () => {
    this.setState({
      isSubmit: false,
    });
  };

  componentDidMount() {
    this.props.user.clearUserAccountPassword();
  }

  // 点击忘记密码
  handleResetPwd = throttle(() => {
    if (!this.props.user.mobile) {
      Toast.error({
        content: '需要首先绑定手机号才能进行此操作',
        duration: 2000,
      });
      setTimeout(() => {
        Router.push({ url: '/user/bind-phone?from=userCenter' });
      }, 1000);
      return;
    }
    Router.push({ url: '/user/reset-password' });
  }, 1000);

  // 输入旧密码
  handleSetOldPwd = (e) => {
    if (trimLR(e.target.value) === '' || !e.target.value) {
      this.props.user.oldPassword = null;
      return;
    }
    this.props.user.oldPassword = e.target.value;
  };

  // 设置账户密码
  handleSetPwd = (e) => {
    if (trimLR(e.target.value) === '' || !e.target.value) {
      this.props.user.newPassword = null;
      return;
    }
    this.props.user.newPassword = e.target.value;
  };

  // 确认新密码
  hadleNewPasswordRepeat = (e) => {
    if (trimLR(e.target.value) === '' || !e.target.value) {
      this.props.user.newPasswordRepeat = null;
      return;
    }
    this.props.user.newPasswordRepeat = e.target.value;
  };

  // 点击提交
  handleSubmit = throttle(async () => {
    if (this.getDisabledWithButton()) return;
    this.setState({
      isSubmit: true,
    });
    const newPassword = this.props.user?.newPassword;
    const newPasswordRepeat = this.props.user?.newPasswordRepeat;
    if (newPassword !== newPasswordRepeat) {
      Toast.error({
        content: '两次密码输入有误',
        hasMask: false,
        duration: 2000,
      });
      this.props.user.clearUserAccountPassword();
      this.initState();
      return;
    }
    if (this.props.user.hasPassword) {
      this.props.user
        .resetUserPassword()
        .then((res) => {
          Toast.success({
            content: '修改密码成功',
            hasMask: false,
            duration: 2000,
          });
          this.initState();
          this.props.onClose && this.props.onClose();
          this.props.user.clearUserAccountPassword();
        })
        .catch((err) => {
          Toast.error({
            content: err.Message || '修改密码失败, 请重新设置',
            hasMask: false,
            duration: 2000,
          });
          this.initState();
          this.props.user.clearUserAccountPassword();
        });
    } else {
      this.props.user
        .setUserPassword()
        .then((res) => {
          Toast.success({
            content: '设置密码成功',
            hasMask: false,
            duration: 2000,
          });
          this.initState();
          this.props.onClose && this.props.onClose();
          this.props.user.clearUserAccountPassword();
          this.props.user.userInfo.hasPassword = true;
        })
        .catch((err) => {
          Toast.error({
            content: err.Message || '设置密码失败, 请重新设置',
            hasMask: false,
            duration: 2000,
          });
          this.initState();
          this.props.user.clearUserAccountPassword();
        });
    }
  }, 300);

  /**
   * 获取禁用按钮状态
   * @returns true 表示禁用 false 表示不禁用
   */
  getDisabledWithButton = () => {
    const oldPassword = this.props.user?.oldPassword;
    const newPassword = this.props.user?.newPassword;
    const newPasswordRepeat = this.props.user?.newPasswordRepeat;
    const { isSubmit } = this.state;
    let isDisabled = false;
    if (isSubmit) {
      isDisabled = isSubmit;
    } else if (this.props.user?.hasPassword) {
      isDisabled = !oldPassword || !newPassword || !newPasswordRepeat;
    } else {
      isDisabled = !newPassword || !newPasswordRepeat;
    }
    return isDisabled;
  };

  handleClose = () => {
    this.props.onClose();
    this.props.user.clearUserAccountPassword();
  };

  renderHasNoPassword = () => {
    return (
      <>
        <div className={styles.inputItem}>
          <Input
            trim
            onChange={this.handleSetPwd}
            mode="password"
            placeholder="请设置密码"
            autoComplete={'new-password'}
            value={this.props.user?.newPassword}
          />
        </div>
        <div className={styles.inputItem}>
          <Input
            trim
            mode="password"
            placeholder="请确认密码"
            autoComplete={'new-password'}
            value={this.props.user?.newPasswordRepeat}
            onChange={this.hadleNewPasswordRepeat}
          />
        </div>
      </>
    );
  };

  renderHasPassword = () => {
    return (
      <>
        <div className={styles.inputItem}>
          <Input
            trim
            onChange={this.handleSetOldPwd}
            value={this.props.user?.oldPassword}
            mode="password"
            autoComplete={'new-password'}
            placeholder="请输入旧密码"
          />
        </div>
        <div className={styles.inputItem}>
          <Input
            trim
            value={this.props.user?.newPassword}
            onChange={this.handleSetPwd}
            mode="password"
            autoComplete={'new-password'}
            placeholder="请输入新密码"
          />
        </div>
        <div className={styles.inputItem}>
          <Input
            trim
            onChange={this.hadleNewPasswordRepeat}
            mode="password"
            autoComplete={'new-password'}
            value={this.props.user?.newPasswordRepeat}
            placeholder="请重复输入新密码"
          />
        </div>
      </>
    );
  };

  render() {
    const { isSubmit } = this.state;
    return (
        <Dialog className={styles.userMobileWrapper} visible={this.props.visible} position="center" maskClosable={true} onClose={this.props.onClose}>
          <div className={styles.userMobileContent}>
            <div className={styles.title}>
              <span className={styles.text}>{this.props.user?.hasPassword ? '修改密码' : '设置密码'}</span>
              <Icon onClick={this.handleClose} name="CloseOutlined" size={12} color={'#8490A8'} />
            </div>
            {this.props.user?.hasPassword ? this.renderHasPassword() : this.renderHasNoPassword()}
            {this.props.site?.isSmsOpen && this.props.user?.hasPassword && (
              <div onClick={this.handleResetPwd} className={styles.tips}>
                忘记旧密码？
              </div>
            )}
            <div
              className={classNames(styles.bottom, {
                [styles.bgBtnColor]: !this.getDisabledWithButton(),
              })}
            >
              <Button
                onClick={this.handleSubmit}
                disabled={this.getDisabledWithButton()}
                type={'primary'}
                className={styles.btn}
              >
                {isSubmit ? <Spin type="spinner">提交中...</Spin> : '提交'}
              </Button>
            </div>
          </div>
        </Dialog>
    );
  }
}
