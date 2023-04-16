import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@discuzqsdk/design';
import styles from './index.module.scss';

const MoneyInput = (props) => {
  const { getmoneyNum, visible, minAmount = 0, maxAmount, inputValue: value, updateState, onChange, moneyInputType } = props;

  const handleChange = (data) => {
    if (typeof onChange === 'function') {
      onChange(data);
    }
  };

  const getColorShow = useMemo(() => {
    if (value == 0.0) {
      return '';
    }
    if (moneyInputType === 'withdrawal' && parseFloat(maxAmount) < parseFloat(value)) {
      return styles.InputRedColor;
    }
    return styles.InputColor;
  }, [value]);

  useEffect(() => {
    updateState({ name: 'inputValue', value: '' });
  }, [visible]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {moneyInputType === 'withdrawal' ? '提现金额' : '充值金额'}
      </div>
      <div className={styles.input}>
        <span className={moneyInputType === 'withdrawal' && parseFloat(maxAmount) < parseFloat(value) ? styles['moneyIcon-Red'] : styles.moneyIcon}>
          ￥
        </span>
        <Input
          className={getColorShow}
          value={value}
          placeholder="0.00"
          onChange={e => handleChange(e.target.value)}
          mode="number"
          maxLength={8}
        />
      </div>
      {moneyInputType === 'withdrawal' ? (
        <div className={styles.leastMoney}>
          {parseFloat(maxAmount) < parseFloat(value) && <p className={styles.leasterr}>提现金额不得大于可提现金额</p>}
          提现金额最低{minAmount || 0}元
        </div>
      ) : (
        <div className={styles.leastMoney}>
          充值金额最低0.1元
        </div>
      )}
    </div>
  );
};

export default MoneyInput;
