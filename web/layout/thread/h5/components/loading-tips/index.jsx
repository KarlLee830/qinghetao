import styles from './index.module.scss';
import React from 'react';
import { Spin } from '@discuzqsdk/design';
import classNames from 'classnames';

// 加载提示
export default function LoadingTips(props) {
  const { type } = props;
  return <div className={classNames(styles.container)}>
        {type === 'init'
          ? <Spin className={styles.init} type="spinner" vertical>初始化页面...</Spin>
          : <Spin className={styles.loadMore}  type="spinner">加载更多...</Spin>
        }
    </div>;
}
