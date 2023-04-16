
import React, { useState, useEffect } from 'react';
import Input from '@discuzqsdk/design/dist/components/input/index';
import { View, Text } from '@tarojs/components';
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
    <View className={styles.container}>
     <View className={styles.header}>提现金额</View>
     <View className={styles.input}>
       <Text className={styles.moneyIcon}>￥</Text>
        <Input
          value={value}
          placeholder="0.00"
          onChange={e => onChange(e.target.value)}
          mode='number'
        />
     </View>
     <View className={styles.leastMoney}>提现金额最低1元</View>
    </View>);
};

export default MoneyInput;
