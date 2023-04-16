import React, { useCallback } from 'react';
import { View, Text } from '@tarojs/components';

import styles from './index.module.scss';

/**
 * 潮流话题
 * @prop {string[]} data 话题数据
 * @prop {function} onItemClick 话题点击事件
 */
const TrendingTopics = ({ data, onItemClick }) => (
    <View className={styles.list}>
    {data.map((item, index, arr) => (
      <Topic key={index} index={index} data={item} onClick={onItemClick} footer={arr.length - index < 3} />
    ))}
  </View>
);


/**
 * 话题组件
 * @prop {title:string, content:string, hotCount:number, contentCount:number} data 话题数据
 * @prop {function} onClick 话题点击事件
 * @prop {number} index
 * @prop {boolean} footer 是否底部组件
 */
const Topic = ({ data, onClick, index, footer }) => {
  const click = useCallback(() => {
    onClick && onClick(data);
  }, [data, onClick]);

  return (
    <View className={`${styles.item} ${footer ? styles.footerItem : ''}`} onClick={click}>
      <Text className={`${styles.index} ${styles[`itemIndex${index + 1}`]}`}>{index + 1}</Text>
      <Text className={styles.text}>{`#${data.content}#`}</Text>
    </View>
  );
};

export default React.memo(TrendingTopics);
