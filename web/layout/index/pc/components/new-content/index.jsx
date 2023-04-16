import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';
import { Spin } from '@discuzqsdk/design';
import { noop } from '@components/thread/utils';

/**
 * 新发布内容
 * @prop {boolean} visible 是否显示新发布内容
 * @prop {number} conNum 有几条新发布内容
 * @prop {function} goRefresh 刷新点击事件
 */
const NewContent = (props) => {
  const {
    visible = false,
    conNum = 0,
    goRefresh = noop
  } = props;

  const [refresh, setRefresh] = useState(false)

  const handleRefresh = () => {
    setRefresh(true)
    goRefresh()
  }

  return (
    <div>
      {
        visible && (
          <div className={styles.container} onClick={handleRefresh}>
            <span className={styles.text}>有{conNum}条新发布的内容</span>
            <div className={styles.refreshBtn}>
              点击刷新
            </div>
            {refresh && <Spin size={14} className={styles.spin} type="spinner" />}
          </div>
        )
      }
    </div>
  );
};

export default React.memo(NewContent);
