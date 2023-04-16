import React, { Component } from 'react';
import styles from './index.module.scss';
import { Dialog, Button, Checkbox, Icon, Toast, Spin } from '@discuzqsdk/design';
import CommonAccountContent from '../../components/common-account-content';
import { inject } from 'mobx-react';
import throttle from '@common/utils/thottle.js';

@inject('payBox')
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  onClose = () => {
    // FIXME: 延时回调的修复
    this.props.payBox.visible = false;
    setTimeout(() => {
      this.props.payBox.clear();
    }, 500);
  };

  goToThePayConfirmPage = throttle(async () => {
    if (this.state.isLoading) return;
    try {
      this.setState({
        isLoading: true,
      });
      await this.props.payBox.createOrder();
      this.setState({
        isLoading: false,
      });
    } catch (error) {
      console.error(error);
      Toast.error({
        content: error.Message || '创建订单失败',
        hasMask: false,
        duration: 1000,
      });
      this.onClose();
      this.setState({
        isLoading: false,
      });
    }
  }, 500);

  // 转换金额小数
  transMoneyToFixed = (num) => {
    return Number(num).toFixed(2);
  };

  render() {
    const { isLoading } = this.state;
    const { options = {} } = this.props.payBox;
    const { amount } = options;
    return (
      <div>
        <>
          <div className={styles.amountWrapper} id={styles.amountContainer}>
            <CommonAccountContent currentPaymentData={options} />
            {/* 按钮区域-提交内容 */}
            <div className={styles.amountAddUp}>
              合计：<span className={styles.amountMoney}>￥{this.transMoneyToFixed(amount)} </span>
            </div>
            <div className={styles.amountSubmit}>
              <Button
                type="primary"
                onClick={this.goToThePayConfirmPage}
                size="large"
                className={styles.asBtn}
                full
                disabled={isLoading}
              >
                {isLoading ? <Spin type="spinner">生成订单中...</Spin> : '确认支付'}
              </Button>
            </div>
            {/* 关闭按钮 */}
            <div onClick={this.onClose} className={styles.amountCloseBtn}>
              <Icon name="CloseOutlined" size={12} />
            </div>
          </div>
        </>
        {/* )} */}
      </div>
    );
  }
}
