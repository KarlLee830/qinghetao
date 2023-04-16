import React, { useState, Component, createRef } from 'react';
import { inject, observer } from 'mobx-react';
import { Popup, Toast } from '@discuzqsdk/design';
import { Icon, Button, Dialog } from '@discuzqsdk/design';
import styles from './index.module.scss';
import MoneyInput from '../money-input';
import classNames from 'classnames';
import Router from '@discuzqsdk/sdk/dist/router';
import Payment from '../payment';

@inject('wallet')
@inject('site')
class WithdrawalPop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
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
      inputValue: '',
      showConfirm: false,
      // receiveAccount: '',
    });
    this.props.onClose && this.props.onClose();
  };

  // 获取禁用逻辑
  getDisabeledButton = () => {
    const { inputValue, receiveAccount } = this.state;
    const { operateWalletType } = this.props;
    let btnDisabled = false;
    if (operateWalletType === 'withdrawal') {
      btnDisabled =
        !inputValue || !receiveAccount ||
        parseFloat(inputValue) > parseFloat(this.props.wallet?.walletAvaAmount) ||
        parseFloat(inputValue) < parseFloat(this.props.site?.cashMinSum);
    }
    if (operateWalletType === 'recharge') {
      btnDisabled = btnDisabled = !inputValue || parseFloat(inputValue) < 0.1;
    }
    return btnDisabled;
  };

  // 提现到微信钱包
  moneyToWeixin = async () => {
    // if (!this.state.inputValue || parseFloat(this.state.inputValue) < parseFloat(this.props.site?.cashMinSum)) {
    //   return Toast.warning({ content: '不得小于最低提现金额' });
    // }
    if (this.getDisabeledButton()) return;
    this.props.wallet
      .createWalletCash({
        money: this.state.inputValue,
        receiveAccount: this.state.receiveAccount,
      })
      .then(async (res) => {
        Toast.success({
          content: '申请提现成功',
          hasMask: false,
          duration: 2000,
        });
        const { getUserWalletInfo } = this.props.wallet;
        await getUserWalletInfo();
        // 如果触发提现回调
        if (this.props.onCreateCash) {
          this.props.onCreateCash();
        }
        this.initState();
      })
      .catch((err) => {
        if (err.Code) {
          Toast.error({
            content: err.Msg || '申请提现失败，请重试',
            duration: 2000,
          });
        }
        this.initState();
      });
  };
  
  operateWallet = (type) => {
    // 提现操作
    if (type === 'withdrawal') {
      this.onConfirm();
      return;
    }
    // 充值操作
    if (type === 'recharge') {
      this.onRechargeMoney(this.state.inputValue);
      return;
    }
  };

  // 确认操作
  onConfirm = () => {
    const paymentInfo = this.paymentRef?.current?.getData();

    this.setState({
      showConfirm: true,
      receiveAccount: paymentInfo?.desc,
    });
  };

  // 充值
  onRechargeMoney = async () => {
    const inputValue = this.state.inputValue;
    this.props.onClose && this.props.onClose();
    const { rechargeMoney } = this.props.wallet;
    const { success, msg } = await rechargeMoney(inputValue);
    if (success) {
      Toast.success({
        content: msg,
        duration: 2000,
      });
      const { getUserWalletInfo } = this.props.wallet;
      await getUserWalletInfo();
      if (this.props.onCreateCash) {
        this.props.onCreateCash();
      }
      this.initState();
    } else {
      Toast.error({
        content: msg,
        duration: 2000,
      });
    }
  };

  render() {
    const { visible: popupVisible, onClose, moneyToWixin, operateWalletType = 'withdrawal' } = this.props;
    const walletAvaAmount = this.props.wallet.walletAvaAmount;
    const cashMinSum = this.props.site?.cashMinSum;

    return (
      <Popup position="center" visible={popupVisible} onClose={onClose}>
        <div
          className={classNames(styles.container, {
            [styles.rechargeContainer]: operateWalletType === 'recharge',
          })}
        >
          <div
            className={classNames(styles.header, {
              [styles.rechargeHeader]: operateWalletType === 'recharge',
            })}
          >
            <div></div>
            <div className={styles.title}>{operateWalletType === 'withdrawal' ? '提现' : '充值'}</div>
            <div onClick={onClose}>
              <Icon name="CloseOutlined" size="12" color="#8590a6"></Icon>
            </div>
          </div>
          {operateWalletType === 'withdrawal' ? (
            <div className={styles.availableAmount}>
              <div className={styles.text}>可提现金额</div>
              <div className={styles.moneyNum}>{walletAvaAmount}</div>
            </div>
          ) : (
            ''
          )}
          <div className={styles.moneyInput}>
            <MoneyInput
              inputValue={this.state.inputValue}
              onChange={this.onChange}
              updateState={this.updateState}
              visible={this.props.visible}
              minAmount={cashMinSum}
              maxAmount={walletAvaAmount}
              moneyInputType={operateWalletType}
            ></MoneyInput>
          </div>
          {operateWalletType === 'withdrawal' && (
            <div className={styles.payment}>
              <Payment ref={this.paymentRef} onChange={desc => this.setState({ receiveAccount: desc })}></Payment>
            </div>
          )}
          <div
            className={classNames(styles.button, {
              [styles.bgBtnColor]: !this.getDisabeledButton(),
              [styles.rechargeButton]: operateWalletType === 'recharge',
            })}
          >
            <Button
              type={'primary'}
              onClick={() => this.operateWallet(operateWalletType)}
              disabled={this.getDisabeledButton()}
            >
              {operateWalletType === 'withdrawal' ? '提现到微信钱包' : '立即充值'}
            </Button>
          </div>

          <Dialog
            isNew={true}
            title="确认信息"
            visible={this.state.showConfirm}
            onClose={() => this.updateState({ name: 'showConfirm', value: false })}
            onCancel={() => this.updateState({ name: 'showConfirm', value: false })}
            onConfirm={() => this.moneyToWeixin()}
          >
            <div className={styles.title}>提现金额：</div>
            <div className={styles.info}>{this.state.inputValue}元</div>
            <div className={styles.title}>提现账号：</div>
            <div className={styles.info}>{this.state.receiveAccount}</div>
          </Dialog>
        </div>
      </Popup>
    );
  }
}

export default WithdrawalPop;
