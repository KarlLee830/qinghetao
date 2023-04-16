
import React from 'react';
import styles from './index.module.scss';
import { Icon } from '@discuzqsdk/design';

const showTop = (props) => {
  const { showContent, setTop } = props;

  return (
    <div className={`${styles.setTop} ${setTop ? styles.inTop : styles.outTop}`}>
      <span className={styles.setTopIcon}>
        <Icon className={styles.icon} name='CheckOutlined'></Icon>
      </span>
      {
        showContent ? '置顶成功' : '已取消置顶'
      }
    </div>);
};

export default showTop;
