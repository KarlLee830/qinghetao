import React from 'react';
import { View, Text } from '@tarojs/components';

import ThreadContent from '@components/thread';

import styles from './index.module.scss';

/**
 * 帖子搜索结果
 * @prop {object[]} data 帖子数据
 * @prop {function} onItemClick 帖子点击事件
 */
const SearchPosts = ({ data, onItemClick }) => (
  <View className={styles.list}>
    {data.map((item, index) => (
        <View key={index}>
          <ThreadContent showBottomStyle={false} className={styles.listItem} data={item} key={index} />
          <View className={styles.hr}></View>
        </View>
    ))}
  </View>
);

export default React.memo(SearchPosts);
