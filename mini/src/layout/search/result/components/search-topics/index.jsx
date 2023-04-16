import React from 'react';
import { View, Text } from '@tarojs/components';
import TopicItem from '@components/topic-item';
import styles from './index.module.scss';

/**
 * 话题搜索结果
 * @prop {object[]} data 话题数据
 * @prop {function} onItemClick 话题点击事件
 */
const SearchTopics = ({ data = [], onItemClick }) => (
  <View className={styles.list}>
    {data && data.map((item, index) => (
      <TopicItem key={index} data={item} onClick={onItemClick} />
    ))}
  </View>
);

export default React.memo(SearchTopics);
