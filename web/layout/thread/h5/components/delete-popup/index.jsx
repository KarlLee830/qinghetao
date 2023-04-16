
import React from 'react';
import { Popup } from '@discuzqsdk/design';
import styles from './index.module.scss';

const deletePop = (props) => {
  const { visible, onClose, onBtnClick } = props;

  return (
    <Popup
      position="center"
      visible={visible}
      onClose={onClose}
    >
      <div className={styles.container}>
        <div className={styles.deleteTips}>
          <div className={styles.tips}>提示</div>
          <div className={styles.content}>确定删除这篇内容吗？</div>
        </div>
        <div className={styles.btn}>
          <div className={styles.close} onClick={onClose}>取消</div>
          <div className={styles.ok} onClick={onBtnClick}>确定</div>
        </div>
      </div>
    </Popup>);
};

export default deletePop;
