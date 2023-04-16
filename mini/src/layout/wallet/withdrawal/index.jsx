import React, { createRef } from 'react';
import { inject, observer } from 'mobx-react';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Dialog from '@discuzqsdk/design/dist/components/dialog/index';
import { View } from '@tarojs/components';
import { IMG_SRC_HOST } from '@common/constants/site';
import classNames from 'classnames';
import MoneyInput from './components/money-input';
import Payment from './components/payment';
import styles from './index.module.scss';
import Taro from '@tarojs/taro';

@inject('wallet')
@inject('site')
@observer
class Withdrawal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      moneyOverThanAmount: false, // 是否超过当前可提现金额
      withdrawalAmount: 0,
      inputValue: '', // 金额输入内容
      showConfirm: false,
      receiveAccount: '',
    };

    this.paymentRef = createRef(null);
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
      moneyOverThanAmount: false, // 是否超过当前可提现金额
      withdrawalAmount: 0,
      inputValue: '',
      showConfirm: false,
      // receiveAccount: '',
    });
  };

  onConfirm = () => {
    const paymentInfo = this.paymentRef?.current?.getData();

    this.setState({
      showConfirm: true,
      receiveAccount: paymentInfo?.desc,
    });
  };

  // 提现到微信钱包
  moneyToWeixin = async () => {
    if (this.getDisabeledButton()) return;
    this.props.wallet
      .createWalletCash({
        money: this.state.inputValue,
        receiveAccount: this.state.receiveAccount,
      })
      .then(async () => {
        Toast.success({
          content: '申请提现成功',
          hasMask: false,
          duration: 1000,
        });
        setTimeout(async () => {
          const { setTabsType, getUserWalletInfo, getCashLog } = this.props.wallet;
          setTabsType('withdrawal');
          await getCashLog();
          await getUserWalletInfo();
          Taro.navigateBack();
          this.initState();
        }, 1000);
      })
      .catch((err) => {
        console.error(err);
        if (err.Code) {
          Toast.error({
            content: err.Msg || '申请提现失败，请重试',
            duration: 2000,
          });
        }
        this.initState();
      });
  };
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
          提现
        </View>
      </View>
    );
  };

  // 获取禁用逻辑
  getDisabeledButton = () => {
    const { inputValue, receiveAccount } = this.state;
    const btnDisabled =
      !inputValue || !receiveAccount ||
      parseFloat(inputValue) > parseFloat(this.props.wallet?.walletAvaAmount) ||
      parseFloat(inputValue) < parseFloat(this.props.site?.cashMinSum);
    return btnDisabled;
  };

  render() {
    return (
      <>
        <View className={styles.container}>
          <View className={styles.main}>
            {/* 自定义顶部返回 */}
            {this.renderTitleContent()}
            <View
              className={styles.totalAmount}
              style={{
                backgroundImage: `url(${IMG_SRC_HOST}/assets/walletbackground.d038c3fcc736f8c7bb086e90c5abe4df9b946fc0.png)`,
              }}
            >
              <View className={styles.moneyTitle}>可提现金额</View>
              <View className={styles.moneyNum}>{this.props.walletData?.availableAmount}</View>
            </View>
            <View className={styles.moneyInput}>
              <MoneyInput
                inputValue={this.state.inputValue}
                onChange={this.onChange}
                updateState={this.updateState}
                visible={this.state.visible}
                minmoney={this.props.site.cashMinSum}
                maxmoney={this.props.walletData?.availableAmount}
                type="withdrawal"
              />
            </View>
            <View className={styles.payment}>
              <Payment ref={this.paymentRef} onChange={desc => this.setState({ receiveAccount: desc })}></Payment>
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
              onClick={this.onConfirm}
              disabled={this.getDisabeledButton()}
            >
              <View className={styles.buttonContent}>提现到微信钱包</View>
            </Button>
          </View>

          <Dialog
            isNew={true}
            title="确认信息"
            visible={this.state.showConfirm}
            onClose={() => this.updateState({ name: 'showConfirm', value: false })}
            onCancel={() => this.updateState({ name: 'showConfirm', value: false })}
            onConfirm={() => this.moneyToWeixin()}
          >
            <View className={styles.title}>提现金额：</View>
            <View className={styles.info}>{this.state.inputValue}元</View>
            <View className={styles.title}>提现账号：</View>
            <View className={styles.info}>{this.state.receiveAccount}</View>
          </Dialog>
        </View>
      </>
    );
  }
}

export default Withdrawal;
