import React from 'react';
import styles from './index.module.scss';
import { Spin } from '@discuzqsdk/design';

export default function LoadingBox(props) {
  return (
    <div className={styles.loadingBox} style={props.style || {}}>
      <Spin type={'spinner'} size={24}/>
      {props.children}
    </div>
  );
}
