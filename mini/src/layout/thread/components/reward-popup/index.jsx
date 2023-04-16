import React, { useState, useEffect } from 'react';
import Popup from '@discuzqsdk/design/dist/components/popup/index';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Input from '@discuzqsdk/design/dist/components/input/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import className from 'classnames';

const InputPop = (props) => {
  const { visible, onOkClick } = props;

  const [value, setValue] = useState('');
  const [refresh, setRefresh] = useState(true); // 手动刷新
  const [maxLength, setMaxLength] = useState(7); // 手动刷新

  useEffect(() => {
    setValue('');
  }, [visible]);

  const onInputChange = (val) => {
    const arr = val.match(/([1-9]\d{0,6}|0)(\.\d{0,2})?/);
    const spot = arr ? arr[0].indexOf('.') : -1;
    if(spot !== -1) {
      setMaxLength(spot + 3);
    } else {
      setMaxLength(7);
    }
    setValue( arr ? arr[0] : '');
    setRefresh(!refresh);
  };

  const rewardList = [1, 2, 5, 10, 20, 50, 88, 128];

  const onRewardClick = (item) => {
    setValue(item);
  };

  const onCancel = () => {
    typeof props?.onCancel === 'function' && props.onCancel();
  }

  const onSubmitClick = async () => {
    if (value === '' || Number(value) <= 0 || Number(value) > 1000000){
      if (value === '' || Number(value) <= 0) {
        Toast.error({
          content: '金额不能为0',
        });
      }
      if (Number(value) > 1000000) {
        Toast.error({
          content: '金额不能超过100万',
        });
      }
      return;
    };
    if (typeof onOkClick === 'function') {
      try {
        const success = await onOkClick(value);
        if (success) {
          setValue('');
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <Popup position="bottom" visible={visible} onClose={onCancel} customScroll={true}>
      <View className={styles.container}>
        <View className={styles.header}>支付作者继续创作</View>

        <View className={styles.rewardInput}>
          <Text className={styles.prepend}>支付金额</Text>
          <Input
            mode="number"
            placeholder="金额"
            maxLength={maxLength}
            className={styles.input}
            value={value}
            onChange={(e) => onInputChange(e.target.value)}
            placeholderClass={styles.inputPlaceholder}
            fixed={true}
            adjustPosition={true}
            cursorSpacing={216}
          />
          <Text className={styles.append}>元</Text>
        </View>

        <View className={styles.rewardList}>
          {rewardList.map((item) => (
            <View
              onClick={() => onRewardClick(item)}
              className={className(styles.reward, Number(value) === item && styles.actived)}
              key={item}
            >
              ￥{item}
            </View>
          ))}
        </View>

        {/* 使用会报错 */}
        {/* <Viewider className={styles.Viewider}></Viewider> */}

        <View className={styles.button}>
          <Button onClick={onCancel} className={styles.cancel} type="default">
            取消
          </Button>
          <Button onClick={onSubmitClick} className={styles.ok} type="primary">
            确定
          </Button>
        </View>
      </View>
    </Popup>
  );
};

export default InputPop;
