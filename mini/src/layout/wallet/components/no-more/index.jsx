import React from 'react';
import { View } from '@tarojs/components';
import classNames from 'classnames';
import styles from './index.module.scss';

export default function NoMore(props) {
  const { empty } = props;
  return empty
    ? <View className={classNames(styles.container, empty && styles.empty)}>暂无内容</View>
    : <View className={styles.container}>没有更多内容了</View>;
}
