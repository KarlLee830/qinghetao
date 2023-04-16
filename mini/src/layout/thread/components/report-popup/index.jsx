import React, { useState } from 'react';
import Popup from '@discuzqsdk/design/dist/components/popup/index';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Textarea from '@discuzqsdk/design/dist/components/textarea/index';
import Radio from '@discuzqsdk/design/dist/components/radio/index';
import { View } from '@tarojs/components';
import styles from './index.module.scss';

const InputPop = (props) => {
  const { visible, onOkClick, onCancel, inputText, reportContent = [] } = props;

  const [value, setValue] = useState('');
  const [showTextarea, setShowTextarea] = useState(false);

  const onChoiceChange = (e) => {
    if (e === 'other') {
      setShowTextarea(true);
      setValue('');
    } else {
      setShowTextarea(false);
      setValue(reportContent[Number(e)]);
    }
  };

  const onSubmitClick = async () => {
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
        <View className={styles.header}>
          <View className={styles.title}>举报</View>
          <View className={styles.reason}>请选择举报理由</View>
        </View>
        <View className={styles.body}>
          <Radio.Group defaultValue="5" onChange={(e) => onChoiceChange(e)}>
            {reportContent.map((val, index) => (
              <View className={styles.reportTitle} key={index}>
                <View className={styles.content}>{val}</View>
                <Radio name={`${index}`}></Radio>
              </View>
            ))}
            <View className={styles.reportTitle}>
              <View className={styles.content}>其他</View>
              <Radio name="other"></Radio>
            </View>
          </Radio.Group>
          {showTextarea ? (
            <View className={styles.textarea}>
              <Textarea
                className={styles.input}
                rows={5}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={inputText}
                placeholderClass={styles.placeholder}
                fixed={true}
                adjustPosition={true}
                cursorSpacing={200}
              ></Textarea>
            </View>
          ) : (
            ''
          )}
        </View>
        <View className={styles.button}>
          <Button onClick={onCancel} className={styles.cancel}>
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
