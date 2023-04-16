import React from 'react';

import styles from './index.module.scss';
import { View, Image } from '@tarojs/components'

/**
 * 单个商品内容展示
 * @prop {string}        image 商品图片
 * @prop {string}        title 商品名称
 * @prop {number|string} amount 商品价格
 * @prop {boolean}       loading
 */

const Index = ({ image, title, amount = 0, loading, className: _className = '', onClick }) => {
  const _title = !loading ? title || '暂无内容' : '内容加载中';

  return (
    <View className={`${styles.container} ${_className}`} onClick={onClick}>
      <Image className={`${styles.image} ${!image ? styles.empty : ''}`} src={image} />
      <View className={styles.content}>
        <View className={styles.title}>{_title}</View>
        <View className={styles.amount}>¥{amount}</View>
      </View>
    </View>
  );
};

export default React.memo(Index);
