import React from 'react';

import ThreadContent from '@components/thread';
import { View, Text } from '@tarojs/components'

import styles from './index.module.scss';

/**
 * 热门内容
 * @prop {object[]} data 帖子数据
 */
const PopularContents = ({ data, onTextItemClick = null, unifyOnClick }) => (
  <View className={styles.list}>
    {
      data.map((item, index) => (
        <View key={index}>
          <ThreadContent showBottomStyle={false} onTextItemClick={onTextItemClick} className={styles.bottom} data={item} key={index} unifyOnClick={unifyOnClick} />
          <View className={styles.hr}></View>
        </View>
      ))
    }
  </View>
);

export default React.memo(PopularContents);
