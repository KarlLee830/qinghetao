import React, { useCallback } from 'react';
import Avatar from '@components/avatar';
import { View, Text, Image } from '@tarojs/components'

import styles from './index.module.scss';

/**
 * 活跃用户
 * @prop {{id:string, image:string, name: string}[]} data 用户数据
 * @prop {function} onItemClick 用户点击事件
 */
const ActiveUsers = ({ data, onItemClick }) => {
  const newData = data.filter((_, index) => index < 10);
  return (
  <View className={styles.list}>
    {newData.length > 0
      && Array(Math.ceil(newData.length / 5))
        .fill('')
        .map((v, rowIndex, rowArr) => (
          <View key={rowIndex} className={`${styles.itemRow} ${rowIndex === rowArr.length - 1 ? styles.lastRow : ''}`}>
            {Array(5)
              .fill('')
              .map((v, index) => {
                const prevIndex = rowIndex * 5;
                const user = newData[index + prevIndex];
                if (!user) return null;
                return <User key={index} data={user} onClick={onItemClick} />;
              })}
          </View>
        ))}
  </View>
  );
};

/**
 * 用户组件
 * @prop {object} data 用户数据
 * @prop {function} onClick 用户点击事件
 */
const User = ({ data, onClick }) => {
  const click = useCallback(() => {
    onClick && onClick(data);
  }, [data, onClick]);

  return (
    <View className={styles.item} onClick={click}>
      <Avatar className={styles.avatarImg} image={data.avatar} name={data.nickname} />
      <View className={styles.name}>{data.nickname || ''}</View>
    </View>
  );
};

export default React.memo(ActiveUsers);
