import React, { useState, useEffect } from 'react';
import { Popup, Button, Input, Divider, Toast } from '@discuzqsdk/design';
import styles from './index.module.scss';
import className from 'classnames';
import browser from '@common/utils/browser';

const InputPop = (props) => {
  const { visible, onOkClick } = props;

  const [value, setValue] = useState('');

  useEffect(() => {
    setValue('');
  }, [visible]);

  const onInputChange = (val) => {
    const arr = val.match(/([1-9]\d{0,6}|0)(\.\d{0,2})?/);
    setValue( arr ? arr[0] : '');
  };

  const rewardList = [1, 2, 5, 10, 20, 50, 88, 128];

  const onRewardClick = (item) => {
    setValue(item);
  };

  const onCancel = () => {
    typeof props?.onCancel === 'function' && props.onCancel();
  }

  const onSubmitClick = async () => {
    if (value === '' || Number(value) <= 0 || Number(value) > 1000000) {
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

  // 当弹框达到一定高度，在ios上会出现部分内容被键盘遮住现象
  const scrollToBottom = () => {
    const scrollHeight = document.body.scrollHeight;
    window.scrollTo(0, scrollHeight);
  }

  const handleFocus = () => {
    if (browser.env('ios')) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }

  return (
    <Popup position="bottom" visible={visible} onClose={onCancel}>
      <div className={styles.container}>
        <div className={styles.header}>支付作者继续创作</div>

        <div className={styles.rewardInput}>
          <span className={styles.prepend}>支付金额</span>
          <Input
            mode="number"
            placeholder="金额"
            className={styles.input}
            value={value}
            onChange={(e) => onInputChange(e.target.value)}
            onFocus={() => handleFocus()}
          />
          <span className={styles.append}>元</span>
        </div>

        <div className={styles.rewardList}>
          {rewardList.map((item) => (
            <div
              onClick={() => onRewardClick(item)}
              className={className(styles.reward, Number(value) === item && styles.actived)}
              key={item}
            >
              ￥{item}
            </div>
          ))}
        </div>

        <Divider className={styles.divider}></Divider>

        <div className={styles.button}>
          <Button onClick={onCancel} className={styles.cancel} type="default">
            取消
          </Button>
          <Button onClick={onSubmitClick} className={styles.ok} type="primary">
            确定
          </Button>
        </div>
      </div>
    </Popup>
  );
};

export default InputPop;
