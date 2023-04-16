import styles from './index.module.scss';
import React from 'react';
import { Spin, Icon } from '@discuzqsdk/design';
import classNames from 'classnames';

// 加载提示
export default function LoadingTips(props) {
  const { type, isError } = props;

  let elem =
    type === 'init' ? (
      <Spin className={styles.init} type="spinner" vertical>
        加载数据中...
      </Spin>
    ) : (
      <Spin className={styles.loadMore} type="spinner">
        加载更多...
      </Spin>
    );

  if (isError) {
    elem = (
      <div className={styles.error}>
        <Icon name="TipsOutlined"></Icon>
        <span className={styles.text}>数据加载失败，请稍后再试</span>
      </div>
    );
  }
  return <div className={classNames(styles.container, type === 'init' && styles.initContainer)}>{elem}</div>;
}
