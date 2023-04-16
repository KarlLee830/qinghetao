import React from 'react';
import styles from './index.module.scss';
import { Popup } from '@discuzqsdk/design';
import { noop } from '../utils';

/**
 * 筛选分类组件
 * @prop {boolean} visible 是否分享弹框
 * @prop {function} onClose 弹框关闭事件
 */
const SharePopup = ({ visible = false, onClose = noop, type='' }) => {
  const sharePoint = '/dzq-img/sharePoint.png';
  const shareKnow = '/dzq-img/shareKnow.png';
  return (
    <Popup
      position="top"
      visible={visible}
      onClose={onClose}
    >
      <div className={`${type === 'thread' ? styles.threadDetail : styles.container}`}>
        <img alt="图片" src={sharePoint} className={styles.sharePoint} />
        <img alt="图片" src={shareKnow} className={styles.shareKnow} onClick={onClose} />
      </div>
    </Popup>);
};

export default React.memo(SharePopup);
