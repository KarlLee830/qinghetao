import React from 'react';
import { Icon } from '@discuzqsdk/design';
import styles from './index.module.scss';

const Index = ({ info = {}, totalCount }) => {
  const { iconName , iconColor, content } = info;

  return (
    <div className={styles.wrapper}>
      <div className={styles['wrapper-inner']}>
        <div className={styles.left}>
          <Icon name={iconName} color={iconColor} size={20} />
        </div>
        <div className={styles.center}>{content}</div>
        <div className={styles.right}>共有{totalCount}条记录</div>
      </div>
    </div>
  )
}

export default Index;
