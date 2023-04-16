import React, { createRef } from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import Header from '@components/header';
import MoneyInput from './components/money-input';
import Payment from './components/payment';
import styles from './index.module.scss';
import { Icon, Button, Toast, Dialog } from '@discuzqsdk/design';
import classNames from 'classnames';
import Router from '@discuzqsdk/sdk/dist/router';

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
  }

  // 提现到微信钱包
  moneyToWeixin = async () => {
    if (this.getDisabeledButton()) return;

    // return;
    this.props.wallet
      .createWalletCash({
        money: this.state.inputValue,
        receiveAccount: this.state.receiveAccount,
      })
      .then(async (res) => {
        Toast.success({
          content: '申请提现成功',
          hasMask: false,
          duration: 1000,
        });
        setTimeout(async ()=>{
          const { setTabsType, getUserWalletInfo } = this.props.wallet;
          setTabsType('withdrawal');
          await getUserWalletInfo();
          this.initState();
          Router.back();
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
    // this.setState({ visible: !this.state.visible });
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
        <Header />
        <div className={styles.container}>
          <div className={styles.main}>
            <div className={styles.totalAmount}>
              <div className={styles.moneyTitle}>可提现金额</div>
              <div className={styles.moneyNum}>{this.props.walletData?.availableAmount}</div>
            </div>
            <div className={styles.moneyInput}>
              <MoneyInput
                inputValue={this.state.inputValue}
                onChange={this.onChange}
                updateState={this.updateState}
                visible={this.state.visible}
                minmoney={this.props.site.cashMinSum}
                maxmoney={this.props.walletData?.availableAmount}
                type="withdrawal"
              />
            </div>
          </div>

          <div className={styles.payment}>
            <Payment ref={this.paymentRef} onChange={desc => this.setState({ receiveAccount: desc })}></Payment>
          </div>

          <div
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
              提现到微信钱包
            </Button>
          </div>
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
      </>
    );
  }
}

export default withRouter(Withdrawal);
