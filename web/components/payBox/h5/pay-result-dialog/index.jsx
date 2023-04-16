import React from 'react';
import { Dialog, Button } from '@discuzqsdk/design';
import styles from './index.module.scss';
import { inject, observer } from 'mobx-react';
import browser from '@common/utils/browser';
import locals from '@common/utils/local-bridge';

@inject('site')
@inject('user')
@inject('payBox')
@observer
class PayResultDialog extends React.Component {
  clearPayBox = () => {
    setTimeout(() => {
      this.props.payBox.clear();
    }, 500);
  }

  componentDidMount() {
    if (browser.env('uc') || browser.env('safari')) {
      const payOrderInfo = locals.get('PAY_ORDER_INFO');
      const payOrderOptions = locals.get('PAY_ORDER_OPTIONS');

      if (payOrderInfo) {
        try {
          const parsedOrderInfo = JSON.parse(payOrderInfo);
          this.props.payBox.orderInfo = parsedOrderInfo;
        } catch (e) {
          console.error(e);
        }
      }

      if (payOrderOptions) {
        try {
          const parsedOrderOptions = JSON.parse(payOrderOptions);
          this.props.payBox.options = parsedOrderOptions;
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  // 在 uc 或 safari 上，由于只能使用 link 拉起，这里主动进行一次回退
  goBack = () => {
    if (browser.env('uc') || browser.env('safari')) {
      window.history.back();
    }
  }

  handleCancel = () => {
    this.clearPayBox();

    this.props.payBox.visible = false;
    this.props.payBox.h5SureDialogVisible = false;

    this.goBack();
  }

  handleSure = () => {
    this.props.payBox.visible = false;
    this.props.payBox.h5SureDialogVisible = false;
    this.props.payBox.getOrderDetail();
    this.clearPayBox();

    this.goBack();
  }

  render() {
    return (
      <Dialog
        style={{
          zIndex: 1500,
        }}
        className={styles.payResultDialog}
        visible={this.props.visible}
      >
        <div className={styles.content}>
          <div className={styles.title}>请确认微信支付是否已完成</div>
          <div className={styles.rule}>
            <p>1.如果您已在打开微信支付成功，请点击 “已完成付款”按钮</p>
            <p>2.如果您没有安装微信支付客户端，请点击“取消”并选择其它支付方式付款</p>
          </div>
          <div className={styles.buttonArea}>
            <div className={styles.buttonWrap}>
              <Button className={styles.cancelButton} onClick={this.handleCancel}>取消</Button>
            </div>
            <div className={styles.buttonWrap}>
              <Button type="primary" onClick={this.handleSure}>已完成付款</Button>
            </div>
          </div>
        </div>
      </Dialog>
    );
  }
}

export default PayResultDialog;
