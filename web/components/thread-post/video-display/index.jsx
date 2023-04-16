import React from 'react';
import styles from './index.module.scss';
import { Video, Icon } from '@discuzqsdk/design';

export default function VideoDisplay(props) {
  const {
    pc,
    src,
    onReady = () => {},
    onDelete = () => { },
  } = props;
  const clsName = pc ? styles.pc : styles.h5;
  return (
    <div id="dzq-post-video" className={`${styles['post-video']} ${clsName}`} onClick={e => e.stopPropagation()}>
      <Video src={src} onReady={onReady} />
      <div className={styles['post-video__delete']} onClick={onDelete}>
        <Icon name="DeleteOutlined" />
      </div>
    </div>
  );
}
