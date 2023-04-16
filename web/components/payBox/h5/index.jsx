import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Popup } from '@discuzqsdk/design';
import { STEP_MAP } from '../../../../common/constants/payBoxStoreConstants';
import AmountRecognized from './amount-recognized';
import PayConfirmed from './pay-confirmed';
import PayResultDialog from './pay-result-dialog';
import PayPwd from './payPwd';
import styles from './index.module.scss';

@inject('payBox')
@observer
export default class index extends Component {
  onClose = () => {
    // FIXME: 延时回调的修复
    this.props.payBox.clear();
  };

  render() {
    const { step } = this.props.payBox;
    return (
      <>
        <Popup
          position="bottom"
          maskClosable={true}
          visible={this.props.payBox.visible}
          onClose={this.onClose}
          className={styles.payPopup}
        >
          {step === STEP_MAP.SURE && <AmountRecognized />}
          {step === STEP_MAP.PAYWAY && <PayConfirmed />}
        </Popup>
        {this.props.payBox.visible && step === STEP_MAP.WALLET_PASSWORD && <PayPwd />}
        {this.props.payBox.visible && <PayResultDialog visible={this.props.payBox.h5SureDialogVisible} />}
      </>
    );
  }
}
