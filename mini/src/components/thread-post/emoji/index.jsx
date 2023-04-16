/**
 * 表情组件
 */
import React, { memo, useEffect, useRef } from 'react';
import { observer, inject } from 'mobx-react';
import { View, Image } from '@tarojs/components';

import styles from './index.module.scss';
import Popup from '@discuzqsdk/design/dist/components/popup/index';


const Index = inject('threadPost')(observer(({ threadPost, show = false, onHide = () => { }, onClick = () => { } }) => {
  const { fetchEmoji, emojis } = threadPost;

  useEffect(async () => {
    !emojis.length && fetchEmoji();
  }, []);

  return (
    <View className={styles['emoji-container']} style={{ display: show ? 'block' : 'none' }}>
      <View className={styles['emoji-container__inner']}>
        {emojis.map((item, index) => <Image className={styles['emoji-item']} key={index} src={item.url} onClick={() => { onClick(item); }} />)}
      </View>
    </View>
  );
}));

export default memo(Index);
