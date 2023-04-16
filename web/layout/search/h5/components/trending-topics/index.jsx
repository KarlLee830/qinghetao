import React, { useCallback } from 'react';

import styles from './index.module.scss';

/**
 * 潮流话题
 * @prop {string[]} data 话题数据
 * @prop {function} onItemClick 话题点击事件
 */
const TrendingTopics = ({ data, onItemClick }) => (
    <div className={styles.list}>
    {data.map((item, index, arr) => (
      <Topic key={index} index={index} data={item} onClick={onItemClick} footer={arr.length - index < 3} />
    ))}
  </div>
);


/**
 * 话题组件
 * @prop {title:string, content:string, hotCount:number, contentCount:number} data 话题数据
 * @prop {function} onClick 话题点击事件
 * @prop {number} index
 * @prop {boolean} footer 是否底部组件
 */
const Topic = ({ data, onClick, index, footer }) => {
  const click = useCallback(() => {
    onClick && onClick(data);
  }, [data, onClick]);

  return (
    <div className={`${styles.item} ${footer ? styles.footerItem : ''}`} onClick={click}>
      <span className={`${styles.index} ${styles[`itemIndex${index + 1}`]}`}>{index + 1}</span>
      <span className={styles.text}>{`#${data.content}#`}</span>
    </div>
  );
};

export default React.memo(TrendingTopics);
