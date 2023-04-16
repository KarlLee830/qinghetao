import React from 'react';
import { inject, observer } from 'mobx-react';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import { View } from '@tarojs/components';
import { IMG_SRC_HOST } from '@common/constants/site';
import classNames from 'classnames';
import MoneyInput from '../withdrawal/components/money-input';
import styles from './index.module.scss';
import Taro from '@tarojs/taro';
import rechargePay from '@common/pay-bussiness/recharge-pay';

@inject('wallet')
@inject('site')
@observer
class Recharge extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      inputValue: '', // 金额输入内容
    };
  }

  updateState = ({ name, value }) => {
    this.setState({
      [name]: value,
    });
  };

  onChange = (data) => {
    const datas = data.match(/([1-9]\d{0,9}|0)(\.\d{0,2})?/);
    this.setState({
      inputValue: datas ? datas[0] : '',
    });
  };

  initState = () => {
    this.setState({
      visible: true,
      inputValue: '',
    });
  };

  // 充值
  onRechargeMoney = async () => {
    if (this.getDisabeledButton()) return;
    const inputValue = this.state.inputValue;
    const { rechargeMoney } = this.props.wallet;
    const { success, msg } = await rechargeMoney(inputValue);

    if (success) {
      Taro.showToast({
        title: msg,
        icon: 'success',
        duration: 2000
      })
      setTimeout(() => {
        Taro.hideToast();
      }, 2000)
      const { setTabsType, getUserWalletInfo, getIncomeDetail } = this.props.wallet;
      setTabsType('income');
      await getIncomeDetail();
      await getUserWalletInfo();
      this.initState();
      setTimeout(() => {
        Taro.navigateBack();
      }, 200)
    } else {
      Taro.showToast({
        title: msg,
        icon: 'fail',
        duration: 2000
      })
      setTimeout(() => {
        Taro.hideToast();
      }, 2000)
    }
  }

  getStatusBarHeight() {
    return wx?.getSystemInfoSync()?.statusBarHeight || 44;
  }

  // 全屏状态下自定义左上角返回按钮位置
  getTopBarBtnStyle() {
    return {
      position: 'fixed',
      top: `${this.getStatusBarHeight()}px`,
      left: '12px',
      transform: 'translate(0, 10px)',
    };
  }

  getTopBarTitleStyle() {
    return {
      position: 'fixed',
      top: `${this.getStatusBarHeight()}px`,
      left: '50%',
      transform: 'translate(-50%, 8px)',
    };
  }

  handleBack = () => {
    Taro.navigateBack();
  };

  // 渲染顶部title
  renderTitleContent = () => {
    return (
      <View className={styles.topBarTitle}>
        <View onClick={this.handleBack} className={styles.customCapsule} style={this.getTopBarBtnStyle()}>
          <Icon size={18} name="LeftOutlined" />
        </View>
        <View style={this.getTopBarTitleStyle()} className={styles.fullScreenTitle}>
          充值
        </View>
      </View>
    );
  };

  // 获取禁用逻辑
  getDisabeledButton = () => {
    const { inputValue } = this.state;
    const btnDisabled =
      !inputValue || parseFloat(inputValue) < 0.1;
    return btnDisabled;
  };

  render() {
    return (
      <>
        <View className={styles.container}>
          <View className={styles.main}>
            {/* 自定义顶部返回 */}
            {this.renderTitleContent()}
            <View className={styles.totalAmount} style={{ backgroundImage: `url(${IMG_SRC_HOST}/assets/walletbackground.d038c3fcc736f8c7bb086e90c5abe4df9b946fc0.png)` }}>
              <View className={styles.moneyTitle}>充值</View>
            </View>
            <View className={styles.moneyInput}>
              <MoneyInput
                inputValue={this.state.inputValue}
                onChange={this.onChange}
                updateState={this.updateState}
                visible={this.state.visible}
                type='recharge'
              />
            </View>
          </View>
          <View
            className={classNames(styles.footer, {
              [styles.bgBtnColor]: !this.getDisabeledButton(),
            })}
          >
            <Button
              type={'primary'}
              className={styles.button}
              onClick={this.onRechargeMoney}
              disabled={this.getDisabeledButton()}
            >
              <View className={styles.buttonContent}>立即充值</View>
            </Button>
          </View>
        </View>
      </>
    );
  }
}

export default Recharge;
