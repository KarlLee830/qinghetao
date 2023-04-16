import React from 'react';

import ThreadContent from '@components/thread';

import styles from './index.module.scss';

/**
 * 热门内容
 * @prop {object[]} data 帖子数据
 */
const PopularContents = ({ data}) => (
  <div className={styles.list}>
    {
      data.map((item, index) => {
        <div className={styles.item}>
          <ThreadContent data={item} key={index}/>
        </div>
      })
    }
  </div>
);

export default React.memo(PopularContents);
