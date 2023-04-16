
import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import Icon from '@discuzqsdk/design/dist/components/icon/index';

const showTop = (props) => {
  const { showContent, setTop } = props;

  return (
    <View className={`${styles.setTop} ${setTop ? styles.inTop : styles.outTop}`}>
      <View className={styles.setTopIcon}>
        <Icon className={styles.icon} name='CheckOutlined'></Icon>
      </View>
      {
        showContent ? '置顶成功' : '已取消置顶'
      }
    </View>);
};

export default showTop;
