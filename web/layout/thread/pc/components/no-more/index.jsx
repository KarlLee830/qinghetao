import styles from './index.module.scss';
import React from 'react';
import classNames from 'classnames';

export default function NoMore(props) {
  const { empty } = props;
  return empty
    ? <div className={classNames(styles.container, empty && styles.empty)}></div>
    : <div className={styles.container}>没有更多数据了</div>;
}
