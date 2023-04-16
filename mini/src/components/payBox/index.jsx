// @ts-nocheck
import React, { Component } from 'react';
// @ts-ignore
import styles from './index.module.scss';
import Popup from '@discuzqsdk/design/dist/components/popup/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import { inject, observer } from 'mobx-react';
import EventEmitter from 'eventemitter3';
import { View } from '@tarojs/components';
import { STEP_MAP } from '../../../../common/constants/payBoxStoreConstants';
import AmountRecognized from './amount-recognized';
import PayConfirmed from './pay-confirmed';
import PayPwd from './payPwd';
// import { ToastProvider } from '@discuzqsdk/design/dist/components/toast/ToastProvider';
import { get } from '../../../../common/utils/get';
import LoginHelper from '@common/utils/login-helper';

class PayBoxEmitter extends EventEmitter {}

const payBoxEmitter = new PayBoxEmitter();

@inject('payBox')
@inject('user')
@observer
export default class PayBox extends Component {
  constructor(props) {
    super(props);
    this.createPayBox = this.createPayBox.bind(this);
    payBoxEmitter.on('createPayBox', this.createPayBox);
  }

  createPayBox = async (
    options = {
      data: {},
    },
  ) => {
    // 每次新的付费创建，需要清空前一次的付费信息
    this.props.payBox.clear();
    // 如果没有用户登录态
    if (!this.props.user.id) {
      Toast.error({
        content: '需要登录后才可以进行支付',
        duration: 2000,
      });
      LoginHelper.saveAndLogin();
      return;
    }
    if (Number(get(options, 'data.amount', 0)) < 0.1) {
      Toast.error({
        content: '最小支付金额必须大于 0.1 元',
      });
      return;
    }
    this.props.payBox.options = {
      ...options.data,
    };
    const noop = () => {};
    this.props.payBox.isAnonymous = options.isAnonymous || false;
    this.props.payBox.onSuccess = options.success || noop;
    this.props.payBox.onFailed = options.failed || noop;
    this.props.payBox.onCompleted = options.completed || noop;
    this.props.payBox.onOrderCreated = options.orderCreated || noop;
    this.props.payBox.visible = true;
  };

  render() {
    return (
      <>
        <View>
          <Popup
            position="bottom"
            maskClosable={true}
            visible={this.props.payBox.visible}
            onClose={() => {
              this.props.payBox.visible = false;
            }}
            className={styles.payPopup}
          >
            <View>{this.props.payBox.step === STEP_MAP.SURE && <AmountRecognized />}</View>
            <View>{this.props.payBox.step === STEP_MAP.PAYWAY && <PayConfirmed />}</View>
          </Popup>
        </View>
        <View
          style={{
            display:
              this.props.payBox.step === STEP_MAP.WALLET_PASSWORD && this.props.payBox.visible ? 'block' : 'none',
          }}
        >
          <PayPwd />
        </View>
      </>
    );
  }
}

/**
 * 订单生成函数
 * @param {{
 *  data: {
 *    amount: number;
 *    redAmount: number;
 *    rewardAmount: number;
 *    isAnonymous: number;
 *    type: number;
 *    threadId: number;
 *    groupId: number;
 *    payeeId: number;
 * }
 * success: (orderInfo: any) => any
 * failed: (orderInfo: any) => any
 * completed: (orderInfo: any) => any
 * }} options
 */
PayBox.createPayBox = (options) => payBoxEmitter.emit('createPayBox', options);
