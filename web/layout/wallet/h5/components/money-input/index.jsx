
import React, { useState, useEffect } from 'react';
import { Input } from '@discuzqsdk/design';
import styles from './index.module.scss';

const MoneyInput = (props) => {
  const { getmoneyNum, visible } = props;

  const [value, setValue] = useState('');

  const onChange = (data) => {
    setValue(data);
    getmoneyNum(data);
  };

  useEffect(() => {
    setValue('');
  }, [visible]);

  return (
    <div className={styles.container}>
     <div className={styles.header}>提现金额</div>
     <div className={styles.input}>
       <span className={styles.moneyIcon}>￥</span>
        <Input
          value={value}
          placeholder="0.00"
          onChange={e => onChange(e.target.value)}
          mode='number'
        />
     </div>
     <div className={styles.leastMoney}>提现金额最低1元</div>
    </div>);
};

export default MoneyInput;
