import { Input, Radio } from '@discuzqsdk/design';
import { View, Text } from '@tarojs/components';
import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import styles from './index.module.scss';
import locals from '@common/utils/local-bridge';

const Payment = (props, ref) => {
  const { onChange = () => {} } = props;

  // 获取缓存
  let info = locals.get('USER_PAYMENT_INFO');
  if (info) {
    try {
      info = JSON.parse(info);
    } catch (error) {
      console.log(error);
    }
  }

  const [wxValue, setWxValue] = useState(info?.wxValue || '');
  const [telValue, setTelValue] = useState(info?.telValue || '');
  const [name, setName] = useState(info?.name || '');
  const [no, setNo] = useState(info?.no || '');

  const [defaultValue, setdefaultValue] = useState(info?.type || 'wx');

  useEffect(() => {
    onChange(getInfoStr());
  }, [wxValue, telValue, name, no, defaultValue]);

  useImperativeHandle(ref, () => ({
    getData: () => {
      const data = {
        type: defaultValue,
        wxValue,
        telValue,
        name,
        no,
      };
      // 设置缓存
      locals.set('USER_PAYMENT_INFO', JSON.stringify(data));
      return { desc: getInfoStr() };
    },
  }));

  const getInfoStr = () => {
    let str = '';
    switch (defaultValue) {
      case 'wx':
        str = wxValue ? `微信：${wxValue || ''}` : '';
        break;
      case 'tel':
        str = telValue ? `手机号：${telValue || ''}` : '';
        break;
      default:
        str = name && no ? `银行卡：${name || ''}；\n 银行卡号：${no || ''}` : '';
        break;
    }
    return str;
  };

  const onItemClick = (e, type) => {
    if (e.target?.dataset?.type !== 'input') {
      setdefaultValue(type);
    }
  };

  return (
    <View className={styles.pay}>
      <View className={`${styles.payItem} ${styles.title}`}>收款账号</View>

      <Radio.Group value={defaultValue} onChange={setdefaultValue}>
        <View className={`${styles.payItem} ${styles.noborder}`} onClick={(e) => onItemClick(e, 'wx')}>
          <Text className={`${styles.label} ${defaultValue === 'wx' && styles.checked}`}>微信号</Text>
          <Input
            placeholder="输入微信号"
            value={wxValue}
            className={styles.input}
            onChange={(e) => setWxValue(e.target.value)}
            data-type="input"
            maxLength={25}
          />
          <Radio name="wx" className={styles.check}></Radio>
        </View>
        <View className={`${styles.payItem} ${styles.tips}`}>优先打款到绑定微信号</View>

        <View className={styles.payItem}  onClick={(e) => onItemClick(e, 'tel')}>
          <Text className={`${styles.label} ${defaultValue === 'tel' && styles.checked}`}>手机号</Text>
          <Input
            placeholder="输入手机号"
            mode="number"
            value={telValue}
            className={styles.input}
            onChange={(e) => setTelValue(e.target.value)}
            data-type="input"
            maxLength={15}
          />
          <Radio name="tel" className={styles.check}></Radio>
        </View>

        <View className={`${styles.payItem} ${styles.noborder}`}  onClick={(e) => onItemClick(e, 'card')}>
          <Text className={`${styles.label} ${defaultValue === 'card' && styles.checked}`}>银行卡</Text>
          <Radio name="card" className={styles.check}></Radio>
        </View>

        <View className={styles.payItem}>
          <Input
            value={name}
            placeholder="输入银行名称，姓名"
            className={styles.input}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
          />
        </View>
        <View className={styles.payItem}>
          <Input
            mode="number"
            value={no}
            placeholder="输入银行卡号"
            className={styles.input}
            onChange={(e) => setNo(e.target.value)}
            maxLength={50}
          />
        </View>
      </Radio.Group>
    </View>
  );
};

export default forwardRef(Payment);
