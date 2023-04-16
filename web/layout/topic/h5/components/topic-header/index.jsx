import React, { useCallback, useState } from 'react';
import { Dropdown, Icon } from '@discuzqsdk/design';
import { noop } from '@components/thread/utils';

import styles from './index.module.scss';

/**
 * 话题头部组件
 */
const TopicHeader = ({ onClick = noop }) => {
  const menu = () => {
    return (
      <Dropdown.Menu>
        <Dropdown.Item id="1">热度</Dropdown.Item>
        <Dropdown.Item id="2">内容数</Dropdown.Item>
      </Dropdown.Menu>
    );
  }
  return (
    <div className={styles.container}>
      <div className={styles.title}>话题列表</div>
      <div className={styles.sortDropdown}>
        <Icon name="SortOutlined" className={styles.icon} size={14} />
        排序
      </div>
    </div>
  );
};

export default React.memo(TopicHeader);
