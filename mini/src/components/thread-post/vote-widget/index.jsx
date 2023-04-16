import React from 'react';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import styles from './index.module.scss';
import { View, Text } from '@tarojs/components';


const Index = ({ onDelete, onClick }) => (
  <View className={styles['vote-widget']} onClick={onClick}>
    <View className={styles.left}>
      <Icon className={styles.icon} name='VoteOutlined' />
      <Text className={styles.text}>投票</Text>
    </View>
    <Icon className={styles.right} name='DeleteOutlined' onClick={(e) => {
      e.stopPropagation();
      onDelete();
    }} />
  </View>
);

export default Index;
