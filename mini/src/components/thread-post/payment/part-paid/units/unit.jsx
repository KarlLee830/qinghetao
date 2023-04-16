import React from 'react';
import { View } from '@tarojs/components';
import styles from '@components/thread-post/payment/index.module.scss';
import { Divider } from '@discuzqsdk/design';

// 容器
const Unit = ({ children, title, desc, rightActionRender = null, withoutDivider = false }) => (
  <View className={styles['paid-unit']}>
    {!withoutDivider && <Divider />}

    {/* 内容区首*/}
    <View className={styles['paid-item']}>
      <View className={styles.left}>{title}</View>
      {rightActionRender && <View className={styles.right}>{rightActionRender()}</View>}
    </View>

    {/* 描述区*/}
    {desc && <View className={styles['paid-unit-desc']}>{desc}</View>}

    {/* 内容渲染区*/}
    {children}
  </View>
);

export default Unit;
