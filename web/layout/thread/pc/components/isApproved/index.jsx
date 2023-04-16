
import React from 'react';
import styles from './index.module.scss';
import { Icon } from '@discuzqsdk/design';

const isApproved = (props) => {
  const { isShow } = props;

  return (
    <div className={`${styles.examine} ${styles.setTop} ${isShow ? styles.inTop : styles.outTop}`}>
      <div className={styles.innerTip}>
        <Icon className={styles.tipsIcon} name="TipsOutlined"></Icon>
        <span className={styles.tipsText}>内容正在审核中，审核通过后才能正常显示！</span>
      </div>
    </div>);
};

export default isApproved;
