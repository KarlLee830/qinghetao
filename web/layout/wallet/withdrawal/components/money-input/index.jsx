import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@discuzqsdk/design';
import styles from './index.module.scss';

const MoneyInput = (props) => {
  const { getmoneyNum, visible, minmoney = 0, maxmoney, inputValue: value, updateState, onChange, type = 'withdrawal' } = props;

  const handleChange = (data) => {
    if (typeof onChange === 'function') {
      onChange(data);
    }
  };

  const getColorShow = useMemo(() => {
    if (value == 0.0) {
      return '';
    }
    if (type === 'withdrawal' && parseFloat(maxmoney) < parseFloat(value)) {
      return styles.InputRedColor;
    }
    return styles.InputColor;
  }, [value]);

  useEffect(() => {
    updateState({ name: 'inputValue', value: '' });
  }, [visible]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>{type === 'withdrawal' ? '提现金额' : '充值金额'}</div>
      <div className={styles.input}>
        <span className={type === 'withdrawal' && parseFloat(maxmoney) < parseFloat(value) ? styles['moneyIcon-Red'] : styles.moneyIcon}>
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
      {
        type === 'withdrawal' ? (
        <div className={styles.leastMoney}>
          {parseFloat(maxmoney) < parseFloat(value) && <p className={styles.leasterr}>提现金额不得大于可提现金额</p>}
          提现金额最低{minmoney || 0}元
        </div>
        ) : (<div className={styles.leastMoney}>充值金额最低0.1元</div>)
      }
    </div>
  );
};

export default MoneyInput;
