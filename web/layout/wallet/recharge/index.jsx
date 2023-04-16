import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import Header from '@components/header';
import MoneyInput from '../withdrawal/components/money-input';
import styles from './index.module.scss';
import { Icon, Button, Toast } from '@discuzqsdk/design';
import classNames from 'classnames';
import Router from '@discuzqsdk/sdk/dist/router';
import isWeixin from '@common/utils/is-weixin';

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
      Toast.success({
        content: msg,
        duration: 2000,
      });
      const { setTabsType, getUserWalletInfo, getIncomeDetail } = this.props.wallet;
      setTabsType('income');
      await getIncomeDetail();
      await getUserWalletInfo();
      this.initState();
      Router.back();
    } else {
      Toast.error({
        content: msg,
        duration: 2000,
      });
    }
  }

  // 获取禁用逻辑
  getDisabeledButton = () => {
    const { inputValue } = this.state;
    const btnDisabled = !inputValue || parseFloat(inputValue) < 0.1;
    return btnDisabled;
  };

  render() {
    return (
      <>
        <Header />
        <div className={styles.container}>
          <div className={styles.main}>
            <div className={styles.totalAmount}>
              <div className={styles.moneyTitle}>充值</div>
            </div>
            <div className={styles.moneyInput}>
              <MoneyInput
                inputValue={this.state.inputValue}
                onChange={this.onChange}
                updateState={this.updateState}
                visible={this.state.visible}
                type='recharge'
              />
            </div>
          </div>
          <div
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
              立即充值
            </Button>
          </div>
        </div>
      </>
    );
  }
}

export default withRouter(Recharge);
