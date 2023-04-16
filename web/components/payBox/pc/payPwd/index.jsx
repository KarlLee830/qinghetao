import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import { STEP_MAP } from '../../../../../common/constants/payBoxStoreConstants';
import { Toast, Icon, Input, Button } from '@discuzqsdk/design';
import throttle from '@common/utils/thottle.js';
@inject('user')
@inject('payBox')
@observer
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      payPassword: null,
      isSubmit: false
    };
  }

  initState = () => {
    this.setState({
      payPassword: null,
      isSubmit: false
    })
  }


  // 点击取消或者关闭---回到上个页面
  handleCancel = () => {
    this.props.payBox.step = STEP_MAP.PAYWAY
    this.initState()
  }

  // 初次设置密码
  handleSetPwd = (e) => {
    this.setState({
      payPassword: e.target.value.replace(/\D/g,''),
    });
  };

  // 点击提交
  handleSubmit = throttle(async () => {
    if (this.state.isSubmit) return
    this.setState({
      isSubmit: true
    })
    const { payPassword } = this.state;
    const { id } = this.props.user;
    this.props.payBox.password = payPassword;
    this.props.payBox
      .setPayPassword(id)
      .then((res) => {
        Toast.success({
          content: '设置密码成功',
          hasMask: false,
          duration: 1000,
        });
        this.props.user.updateUserInfo(id);
        this.props.payBox.step = STEP_MAP.PAYWAY;
        this.props.payBox.visible = true;
        this.initState();
      })
      .catch((err) => {
        console.log(err);
        Toast.error({
          content: '设置失败请重新设置',
          hasMask: false,
          duration: 1000,
        });
        this.initState();
      });
  },500);

  render() {
    const { list = [], payPassword, isSubmit } = this.state;
    return (
      <div className={styles.payPwdWrapper}>
        <div className={styles.payTop}>
          <div className={styles.payTitle}>设置支付密码</div>
          {/* 关闭按钮 */}
          <div className={styles.payBoxCloseIcon} onClick={this.handleCancel}>
            <Icon name="CloseOutlined" size={12} />
          </div>
        </div>
        <Input type="number" maxLength={6} value={payPassword} onChange={this.handleSetPwd} mode="password" className={styles.payInput} placeholder="请输入支付密码" />
        <Button onClick={this.handleSubmit} disabled={!payPassword || payPassword.length !== 6 || isSubmit} type={'primary'} className={styles.payBtn}>设置支付密码</Button>
      </div>
    );
  }
}
