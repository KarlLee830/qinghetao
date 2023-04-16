import React, { useState, useEffect } from 'react';
import { View, Image } from '@tarojs/components';
import styles from './index.module.scss';

export default function Emoji(props) {
  const { emojis = [], onClick, show, pc } = props;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(show);
  }, [show]);

  if (!visible) return null;

  const cls = styles.h5;

  return (
    <View id="dzq-toolbar-emoji" className={`${styles['dzq-emoji']} ${cls} dzq-toolbar-emoji`}>
      {emojis.map((item) => (
        <Image
          className={styles['dzq-emoji__icon']}
          key={item.code}
          src={item.url}
          onClick={(e) => {
            e.stopPropagation();
            onClick(item);
          }}
        />
      ))}
    </View>
  );
}
