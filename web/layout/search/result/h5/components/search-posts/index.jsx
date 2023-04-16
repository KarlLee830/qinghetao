import React from 'react';

import ThreadContent from '@components/thread';

import styles from './index.module.scss';

/**
 * 帖子搜索结果
 * @prop {object[]} data 帖子数据
 * @prop {function} onItemClick 帖子点击事件
 */
const SearchPosts = ({ data, onItemClick }) => (
  <div className={styles.list}>
    {data.map((item, index) => (
        <div key={index}>
          <ThreadContent showBottomStyle={false} className={styles.listItem} data={item} key={`${item.threadId}-${item.updatedAt}`} />
          <div className={styles.hr}></div>
        </div>
    ))}
  </div>
);

export default React.memo(SearchPosts);
