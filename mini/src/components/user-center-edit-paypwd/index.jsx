import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Taro, { getCurrentInstance } from '@tarojs/taro';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Input from '@discuzqsdk/design/dist/components/input/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Spin from '@discuzqsdk/design/dist/components/spin/index';
import styles from './index.module.scss';
import { View, Text } from '@tarojs/components';
import throttle from '@common/utils/thottle.js';
import classNames from 'classnames';

@inject('site')
@inject('user')
@inject('payBox')
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
    this.props.payBox.clearPayPassword();
  }

  // 点击去到下一步 ---> 清空旧密码oldPayPwd状态
  goToResetPayPwd = throttle(() => {
    if (this.getDisabledWithButton()) return;
    this.setState({
      isSubmit: true,
    });
    this.props.payBox
      .getPayPwdResetToken()
      .then(() => {
        Taro.navigateTo({ url: '/userPages/my/edit/reset/paypwd/index' });
        this.props.payBox.oldPayPwd = null;
        this.initState();
      })
      .catch((err) => {
        Toast.error({
          content: err.Msg || '密码错误',
          hasMask: false,
          duration: 2000,
        });
        this.props.payBox.oldPayPwd = null;
        this.initState();
      });
  }, 300);

  // 点击忘记密码
  handleGoToFindPayPwd = throttle(() => {
    if (!this.props.user.mobile) {
      Toast.error({
        content: '需要首先绑定手机号才能进行此操作',
        duration: 2000,
      });
      setTimeout(() => {
        Taro.navigateTo({ url: '/userPages/user/bind-phone/index?from=userCenter' });
      }, 1000);
      return;
    }
    Taro.navigateTo({ url: '/userPages/my/edit/find/paypwd/index' });
  }, 1000);

  // 初次设置密码 password
  handleSetPwd = (e) => {
    const securityCode = e.target.value.match(/^[0-9]*$/);
    if (!securityCode) return;
    this.props.payBox.password = securityCode[0];
  };

  // 点击修改旧密码 oldPayPwd
  handleChangeOldPwd = (e) => {
    const securityCode = e.target.value.match(/^[0-9]*$/);
    if (!securityCode) return;
    this.props.payBox.oldPayPwd = securityCode[0];
  };

  // 处理支付相关逻辑
  handlePayBoxWithTriggerIncident = async () => {
    const { id } = this.props?.user;
    try {
      Taro.navigateBack({ delta: 1 });
      await this.props.user.updateUserInfo(id);
      await this.props.payBox.getWalletInfo(id);
      this.props.user.userInfo.canWalletPay = true;
      this.props.payBox.visible = true;
      this.props.payBox.password = null;
      this.initState();
    } catch (error) {
      Toast.error({
        content: '获取用户钱包信息失败',
        duration: 2000,
      });
      this.initState();
    }
  };

  // 点击提交 ----> 设置密码password成功 ---> 清空 password状态
  handleSubmit = throttle(async () => {
    if (this.getDisabledWithButton()) return;
    this.setState({
      isSubmit: true,
    });
    const { id } = this.props.user;
    this.props.payBox
      .setPayPassword(id)
      .then(async (res) => {
        Toast.success({
          content: '设置密码成功',
          hasMask: false,
          duration: 2000,
        });
        const { type } = getCurrentInstance().router.params;
        if (type === 'paybox') {
          this.handlePayBoxWithTriggerIncident();
          return;
        }
        // 防止跳转过快
        setTimeout(() => {
          Taro.redirectTo({ url: '/userPages/my/edit/index' });
          this.props.user.userInfo.canWalletPay = true;
          this.props.payBox.password = null;
          this.initState();
        }, 200);
      })
      .catch((err) => {
        Toast.error({
          content: '设置失败请重新设置',
          hasMask: false,
          duration: 2000,
        });
        this.props.payBox.password = null;
        this.initState();
      });
  }, 500);

  /**
   * 获取按钮禁用状态
   * @returns true 表示禁用 false表示不禁用
   */
  getDisabledWithButton = () => {
    const payPassword = this.props.payBox?.password;
    const oldPayPwd = this.props.payBox?.oldPayPwd;
    const { isSubmit } = this.state;
    let disabled = false;
    if (isSubmit) {
      disabled = isSubmit;
    } else if (this.props.user?.canWalletPay) {
      disabled = !oldPayPwd || oldPayPwd.length !== 6;
    } else {
      disabled = !payPassword || payPassword.length !== 6;
    }
    return disabled;
  };

  // 如果没有设置支付密码 显示设置支付密码
  renderSetPayPwd = () => {
    return (
      <View className={styles.content}>
        <Text className={styles.setTtile}>设置支付密码</Text>
        <View className={styles.paypwdInput}>
          <Input
            className={styles.input}
            miniType="number"
            maxLength={6}
            value={this.props.payBox?.password}
            onChange={this.handleSetPwd}
            placeholder="请设置您的支付密码"
            mode="password"
            trim
          />
        </View>
      </View>
    );
  };

  // 渲染已经设置了支付密码内容
  renderCanPayPwd = () => {
    return (
      <View className={styles.content}>
        <Text className={styles.setTtile}>修改密码</Text>
        <View className={styles.labelInfo}>
          <View className={styles.labelValue}>
            <Input
              className={styles.input}
              maxLength={6}
              value={this.props.payBox?.oldPayPwd}
              mode="password"
              placeholder="请输入旧密码"
              onChange={this.handleChangeOldPwd}
              trim
              type="number"
            />
          </View>
          {this.props.site?.isSmsOpen && (
            <View onClick={this.handleGoToFindPayPwd} className={styles.tips}>
              忘记旧密码？
            </View>
          )}
        </View>
      </View>
    );
  };

  render() {
    const { isSubmit } = this.state;
    return (
      <View id={styles.setPayPwdContent}>
        {this.props.user?.canWalletPay ? this.renderCanPayPwd() : this.renderSetPayPwd()}
        <View
          className={classNames(styles.bottom, {
            [styles.bgBtnColor]: !this.getDisabledWithButton(),
          })}
        >
          {this.props.user?.canWalletPay ? (
            <Button
              full
              disabled={this.getDisabledWithButton()}
              onClick={this.goToResetPayPwd}
              type={'primary'}
              className={styles.btn}
            >
              {isSubmit ? <Spin type="spinner">加载中...</Spin> : '下一步'}
            </Button>
          ) : (
            <Button
              full
              disabled={this.getDisabledWithButton()}
              onClick={this.handleSubmit}
              type={'primary'}
              className={styles.btn}
            >
              {isSubmit ? <Spin type="spinner">提交中...</Spin> : '提交'}
            </Button>
          )}
        </View>
      </View>
    );
  }
}

export default index;
