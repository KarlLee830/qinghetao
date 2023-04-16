import React from 'react';
import { Popup, Button } from '@discuzqsdk/design';
import styles from './index.module.scss';

const deletePop = (props) => {
  const { visible, onClose, onBtnClick, type = 'comment' } = props;

  return (
    <Popup position="center" visible={visible} onClose={onClose}>
      <div className={styles.container}>
        <div className={styles.deleteTips}>
          <div className={styles.tips}>提示</div>
          <div className={styles.content}>
            {type === 'thread' ? '确定删除这篇内容吗？' : '确定删除这条评论吗？'}
          </div>
        </div>
        <div className={styles.btn}>
          <Button className={styles.close} onClick={onClose}>
            取消
          </Button>
          <Button type='primary' className={styles.ok} onClick={onBtnClick}>
            确定
          </Button>
        </div>
      </div>
    </Popup>
  );
};

export default deletePop;
