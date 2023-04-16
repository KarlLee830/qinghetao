import React, { useState, useEffect } from 'react';
import Popup from '@discuzqsdk/design/dist/components/popup/index';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Slider from '@discuzqsdk/design/dist/components/slider/index';
import { debounce } from '@common/utils/throttle-debounce';
import { View } from '@tarojs/components';
import styles from './index.module.scss';

const InputPop = (props) => {
  const { visible, onOkClick, onCancel, remainMoney, money } = props;

  const maxPercent = parseInt((remainMoney / money) * 100);

  const [value, setValue] = useState(0);
  const [moneyNum, setMoneyNum] = useState(0);
  const [isShowMaxMoney, setIsShowMaxMoney] = useState(false);

  useEffect(() => {
    if(moneyNum >= remainMoney) {
      setIsShowMaxMoney(true);
    } else {
      setIsShowMaxMoney(false);
    }
  }, [moneyNum]);

  // const onInputChange = (val) => {
  //   if (Number(val) >= 0 && Number(val) <= 100) {
  //     setValue(val);
  //     setMoneyNum(Number(val) * 0.01 * rewardAmount);
  //   } else {
  //     Toast.success({
  //       content: '请输入0-100',
  //     });
  //   }
  // };
  const onInputChange = (val) => {
    setValue(Number(val));
    setMoneyNum((Number(val) * 0.01 * money).toFixed(2));
  };

  const onSubmitClick = async () => {
    if (typeof onOkClick === 'function') {
      try {
        const success = await onOkClick(moneyNum);
        if (success) {
          setValue(0);
          setMoneyNum(0);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <Popup position="bottom" visible={visible} onClose={onCancel} customScroll={true}>
      <View className={styles.container}>
        <View className={styles.main}>
          <View className={styles.header}>采纳回复悬赏</View>
          <View className={styles.body}>
            <View className={styles.percentage}>
              <View className={styles.text}>悬赏百分比</View>
              <View className={styles.slider}>
                <Slider
                  defaultValue={value}
                  value={value}
                  max={maxPercent}
                  min={0}
                  step={5}
                  onChange={debounce((val) => onInputChange(val), 200)}
                  formatter={(value) => `${value}`}
                />
                <View className={styles.perCent}>%</View>
                {isShowMaxMoney && (<View className={styles.maxMoney}>*已达到最大可用金额</View>)}
              </View>
            </View>
            <View className={styles.rewardMoney}>
              <View className={styles.text}>悬赏金额</View>
              <View className={styles.moneyNum}>{moneyNum}元</View>
            </View>
          </View>
        </View>
        <View className={styles.button}>
          <Button full={true} onClick={onCancel} className={styles.cancel} type="text" size="medium">
            取消
          </Button>
          <Button full={true} onClick={onSubmitClick} className={styles.ok} type="primary" size="medium">
            确定
          </Button>
        </View>
      </View>
    </Popup>
  );
};

export default InputPop;
