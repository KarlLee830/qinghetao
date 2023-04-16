import React from 'react';
import styles from './index.module.scss';
import Taro, { getCurrentInstance, eventCenter } from '@tarojs/taro';
import { inject, observer } from 'mobx-react';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Radio from '@discuzqsdk/design/dist/components/radio/index';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Spin from '@discuzqsdk/design/dist/components/spin/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import { View, Text } from '@tarojs/components';
import { PAY_MENT_MAP, PAYWAY_MAP, STEP_MAP } from '../../../../../common/constants/payBoxStoreConstants.js';
import {
  listenWXJsBridgeAndExecCallback,
  onBridgeReady,
  wxValidator,
  mode,
} from '../../../../../common/store/pay/weixin-miniprogram-backend.js';
import throttle from '@common/utils/thottle.js';
import Router from '@discuzqsdk/sdk/dist/router';

@inject('site')
@inject('user')
@inject('payBox')
@observer
export default class PayBox extends React.Component {
  constructor(props) {
    super(props);
    const payConfig = [
      {
        name: '钱包支付',
        icon: 'PurseOutlined',
        color: '#1878f3',
        paymentType: 'wallet',
      },
    ];

    // 判断是否微信支付开启
    if (this.props.site.isWechatPayOpen) {
      payConfig.unshift({
        name: '微信支付',
        icon: 'WechatPaymentOutlined',
        color: '#09bb07',
        paymentType: 'weixin',
      });
    }

    this.state = {
      payConfig,
      isSubmit: false,
    };
    this.goSetPayPwa = this.goSetPayPwa.bind(this);
  }

  $instance = getCurrentInstance();

  initState = () => {
    this.setState({
      isSubmit: false,
    });
    this.props.payBox.payWay = PAYWAY_MAP.WALLET;
    this.props.payBox.password = null;
  };

  // 转换金额小数
  transMoneyToFixed = (num) => {
    return Number(num).toFixed(2);
  };

  componentWillMount = () => {
    const onShowEventId = this.$instance.router.onShow;
    // 监听
    eventCenter.on(onShowEventId, this.onShow);
  };

  componentWillUnmount = () => {
    const onShowEventId = this.$instance.router.onShow;
    // 卸载
    eventCenter.off(onShowEventId, this.onShow);
  };

  async componentDidMount() {
    const { id } = this.props?.user;
    try {
      this.initState();
      await this.props.payBox.getWalletInfo(id);
    } catch (error) {
      Toast.error({
        content: '获取用户钱包信息失败',
        duration: 1000,
      });
    }
    this.isRecharge();
  }

  onShow = async () => {
    const { id } = this.props.user;
    await this.props.payBox.getWalletInfo(id);
    await this.props.user.updateUserInfo(id);
  };

  // 跳转至充值页
  toRechargePage = () => {
    this.props.payBox.visible = false;
    Router.push({ url: '/subPages/wallet/recharge/index' });
    return;
  }

  // 判断是否是充值
  isRecharge = () => {
    const { isWechatPayOpen, webConfig } = this.props.site || {};
    const { siteCharge } = webConfig.setSite || {};
    const isShowRecharge = isWechatPayOpen && siteCharge === 1;
    if (!isShowRecharge) return;
    const { options = {} } = this.props.payBox;
    const { type } = options;
    // 去除钱包支付，保留微信支付
    if (type === 30) {
      this.props.payBox.payWay = PAYWAY_MAP.WX;
      this.state.payConfig.pop();
      this.setState({ payConfig: this.state.payConfig });
    }
  }

  walletPaySubText() {
    const canWalletPay = this.props.user?.canWalletPay;
    const { options = {} } = this.props.payBox;
    const { amount = 0 } = options;
    if (!canWalletPay) {
      return (
        <Text className={styles.subText} onClick={this.goSetPayPwa}>
          请设置支付密码
        </Text>
      );
    }

    if (Number(this.props.payBox?.walletAvaAmount) < Number(amount)) {
      return <View className={styles.subText}>余额不足</View>;
    }

    return (
      <>
        {this.props.payBox?.walletAvaAmount ? (
          <Text className={styles.subText}>钱包余额：￥{this.props.payBox?.walletAvaAmount}</Text>
        ) : (
          <Spin type="spinner" size={14}></Spin>
        )}
      </>
    );
  }

  goSetPayPwa() {
    Taro.navigateTo({ url: `/userPages/my/edit/paypwd/index?type=paybox` });
    this.props.payBox.visible = false;
  }

  /**
   * 选择支付方式
   */
  handleChangePaymentType = (value) => {
    this.props.payBox.payWay = value;
  };

  // 点击确认支付
  handlePayConfirmed = throttle(async () => {
    if (this.props.payBox.payWay === PAYWAY_MAP.WALLET) {
      const { options = {} } = this.props.payBox;
      const { amount = 0 } = options;
      if (Number(this.props.payBox?.walletAvaAmount) < Number(amount)) {
        // 钱包余额不足 && 开启微信支付 && 开启充值功能 && 小程序设置了开启充值 跳转到充值页
        const { isWechatPayOpen, webConfig } = this.props.site || {};
        const { siteCharge } = webConfig.setSite || {};
        const { threadOptimize } = webConfig.other || {};
        const isShowRecharge = isWechatPayOpen && siteCharge === 1 && threadOptimize;
        // if (isShowRecharge) {
        //   this.toRechargePage();
        //   return;
        // }
        Toast.error({
          content: '钱包余额不足',
          duration: 2000,
        });
        return;
      }
      // 表示钱包支付
      this.props.payBox.walletPayEnsure();
    } else if (this.props.payBox.payWay === PAYWAY_MAP.WX) {
      try {
        this.setState({
          isSubmit: true,
        });
        await this.props.payBox.wechatPayOrder({ listenWXJsBridgeAndExecCallback, onBridgeReady, wxValidator, mode });
        this.setState({
          isSubmit: false,
        });
      } catch (error) {
        console.error(error);
        Toast.error({
          content: error.Message || '拉起微信支付失败',
          duration: 2000,
        });
        this.setState({
          isSubmit: false,
        });
      }
    }
  }, 300);

  // 点击取消
  handleCancel = () => {
    // 回到上一步
    this.props.payBox.step = STEP_MAP.SURE;
    this.props.payBox.payWay = null;
  };

  // 获取按钮禁用状态
  getDisabledWithButton = () => {
    const { isSubmit } = this.state;
    const canWalletPay = this.props.user?.canWalletPay;
    const { options = {} } = this.props.payBox;
    const { amount = 0 } = options;
    let disabled = !this.props.payBox.payWay || isSubmit;
    if (this.props.payBox.payWay === PAYWAY_MAP.WALLET) {
      if (!canWalletPay) {
        disabled = true;
      }
      if (Number(this.props.payBox?.walletAvaAmount) < Number(amount) && !this.isToRecharge()) {
        disabled = true;
      }
    }
    return disabled;
  };

  // 支付按钮文本显示
  getPayText = () => {
    const { options = {} } = this.props.payBox;
    const { amount = 0 } = options;
    // if (this.isToRecharge()) {
    //   return '去充值';
    // }
    return '确定支付';
  }

  isToRecharge = () => {
    const { options = {} } = this.props.payBox;
    const { amount = 0 } = options;
    const siteCharge = true;
    const isWechatPayOpen = this.props.site.isWechatPayOpen;
    // 去充值，需要开启微信支付 && 开启充值功能 && 支付方式为钱包支付 && 钱包余额不足
    if (isWechatPayOpen && siteCharge && this.props.payBox.payWay === PAYWAY_MAP.WALLET && Number(this.props.payBox?.walletAvaAmount) < Number(amount)) return true;
    return false;
  }

  render() {
    const { options = {} } = this.props.payBox;
    const { payConfig, isSubmit } = this.state;
    const canWalletPay = this.props.user?.canWalletPay;

    return (
      <View className={styles.payBox}>
        <View className={styles.title}>
          <Text>
            <Text className={styles.moneyUnit}>￥</Text>
            {this.transMoneyToFixed(options.amount)}
          </Text>
        </View>
        <View className={styles.list}>
          <Radio.Group
            value={this.props.payBox.payWay}
            onChange={(checked) => {
              this.handleChangePaymentType(checked);
            }}
          >
            {payConfig.map((item, key) => {
              return (
                <View key={key} className={styles.listItem}>
                  <View className={styles.left}>
                    <Icon className={styles.icon} name={item.icon} color={item.color} size={20} />
                    <Text className={styles.text}>{item.name}</Text>
                  </View>
                  <View className={styles.right}>
                    {item.paymentType === PAYWAY_MAP.WALLET && this.walletPaySubText()}
                    {(item.paymentType === PAYWAY_MAP.WX ||
                      (canWalletPay && Number(this.props.payBox?.walletAvaAmount) >= Number(options.amount))) && (
                      <Radio name={item.paymentType} />
                    )}
                    {this.isToRecharge() && item.paymentType === PAYWAY_MAP.WALLET && (
                      <View className={styles.textPrimary} onClick={this.toRechargePage}>
                        充值
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </Radio.Group>
        </View>
        <View className={styles.btnBox}>
          <Button
            disabled={this.getDisabledWithButton()}
            className={styles.btn}
            type="primary"
            size="large"
            full
            onClick={this.handlePayConfirmed}
          >
            {isSubmit ? <Spin type="spinner">拉起支付中...</Spin> : this.getPayText()}
          </Button>
        </View>
        {/* 关闭按钮 */}
        <View className={styles.payBoxCloseIcon} onClick={this.handleCancel}>
          <Icon name="CloseOutlined" size={12} />
        </View>
      </View>
    );
  }
}
