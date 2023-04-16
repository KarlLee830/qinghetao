import React from 'react';
import styles from './index.module.scss';
import { View } from '@tarojs/components';
import classNames from 'classnames';

export default function NoMore(props) {
  const { empty } = props;
  return empty
    ? <View className={classNames(styles.container)}>暂无评论</View>
    : <View className={styles.container}>没有更多数据了</View>;
}
