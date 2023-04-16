import React, { useEffect, useMemo } from 'react';
import Input from '@discuzqsdk/design/dist/components/input/index';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

const MoneyInput = (props) => {
  const { getmoneyNum, visible, minmoney = 1, maxmoney, inputValue: value, updateState, onChange, type = 'withdrawal' } = props;

  // const [value, setValue] = useState('');

  // const onChange = (data) => {
  //   const datas = data.match(/([1-9]\d{0,9}|0)(\.\d{0,2})?/);
  //   setValue(datas ? datas[0] : '');
  //   getmoneyNum(datas ? datas[0] : '');
  // };

  const handleChange = (data) => {
    if (typeof onChange === 'function') {
      onChange(data);
    }
  };

  const getColorShow = useMemo(() => {
    if (value == 0.0) {
      return '';
    } else if (type === 'withdrawal' && parseFloat(maxmoney) < parseFloat(value)) {
      return styles.InputRedColor;
    } else {
      return styles.InputColor;
    }
  }, [value]);

  useEffect(() => {
    updateState({ name: 'inputValue', value: '' });
  }, [visible]);

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        {type === 'withdrawal' ? '提现金额' : '充值金额'}
      </View>
      <View className={styles.input}>
        <Text className={type === 'withdrawal' && parseFloat(maxmoney) < parseFloat(value) ? styles['moneyIcon-Red'] : styles.moneyIcon}>
          ￥
        </Text>
        <Input
          className={getColorShow}
          value={value}
          placeholder="0.00"
          onChange={(e) => handleChange(e.target.value)}
          mode="number"
          placeholder-style="color:#c5c6ca;"
          maxLength={8}
        />
      </View>
      <View>
        {
          type === 'withdrawal' ? (
            <View>
              {parseFloat(maxmoney) < parseFloat(value) && (
                <View className={`${styles.leastMoney} ${styles.leasterr}`}>提现金额不得大于可提现金额</View>
              )}
              <View className={`${styles.leastMoney} ${parseFloat(maxmoney) < parseFloat(value) && styles.leastMargin}`}>
                提现金额最低{minmoney}元
              </View>
            </View>
          ) : (
            <View className={styles.leastMoney}>
                充值金额最低0.1元
            </View>
          )
        }
      </View>
    </View>
  );
};

export default MoneyInput;
