import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Input, Toast, Spin } from '@discuzqsdk/design';
import Header from '@components/header';
import styles from './index.module.scss';
import Router from '@discuzqsdk/sdk/dist/router';
import { withRouter } from 'next/router';
import throttle from '@common/utils/thottle.js';
import { trimLR } from '@common/utils/get-trimly.js';
import classNames from 'classnames';
@inject('site')
@inject('user')
@observer
class index extends Component {
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
          this.props.user.clearUserAccountPassword();
          setTimeout(() => {
            Router.back();
          }, 300);
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
          this.props.user.clearUserAccountPassword();
          setTimeout(() => {
            Router.back();
          }, 300);
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

  // 渲染未设置密码
  renderHasNoPassword = () => (
    <>
      <h3>设置密码</h3>
      <div className={styles.labelInfo}>
        <div className={styles.labelValue}>
          <Input
            className={styles.input}
            onChange={this.handleSetPwd}
            mode="password"
            placeholder="请设置密码"
            value={this.props.user?.newPassword}
            trim
          />
        </div>
      </div>
      <div className={styles.labelInfo}>
        <div className={styles.labelValue}>
          <Input
            className={styles.input}
            mode="password"
            placeholder="请确认密码"
            value={this.props.user?.newPasswordRepeat}
            onChange={this.hadleNewPasswordRepeat}
            trim
          />
        </div>
      </div>
    </>
  );

  // 渲染已设置密码
  renderHasPassword = () => (
    <>
      <h3>修改密码</h3>
      <div className={styles.labelInfo}>
        <div className={styles.labelValue}>
          <Input
            className={styles.input}
            value={this.props.user?.oldPassword}
            onChange={this.handleSetOldPwd}
            mode="password"
            placeholder="请输入旧密码"
            trim
          />
        </div>
      </div>
      <div className={styles.labelInfo}>
        <div className={styles.labelValue}>
          <Input
            className={styles.input}
            value={this.props.user?.newPassword}
            onChange={this.handleSetPwd}
            mode="password"
            placeholder="请输入新密码"
            trim
          />
        </div>
      </div>
      <div className={styles.labelInfo}>
        <div className={styles.labelValue}>
          <Input
            className={styles.input}
            onChange={this.hadleNewPasswordRepeat}
            mode="password"
            value={this.props.user?.newPasswordRepeat}
            placeholder="请重复输入新密码"
            trim
          />
        </div>
      </div>
    </>
  );

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

  render() {
    const { isSubmit } = this.state;
    return (
      <div id={styles.accountPwdContent}>
        <Header />
        <div className={styles.content}>
          {this.props.user?.hasPassword ? this.renderHasPassword() : this.renderHasNoPassword()}
        </div>
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
            full
            onClick={this.handleSubmit}
            disabled={this.getDisabledWithButton()}
            type={'primary'}
            className={styles.btn}
          >
            {isSubmit ? <Spin type="spinner">提交中...</Spin> : '提交'}
          </Button>
        </div>
      </div>
    );
  }
}

export default withRouter(index);
