import React, { useCallback, useMemo } from 'react';
import replaceSearchResultContent from '@common/utils/replace-search-result-content';
import ThreadContent from '@components/thread';
import styles from './index.module.scss';
import FilterRichText from '@components/filter-rich-text'

/**
 * 话题组件
 * @prop {title:string, content:string, hotCount:number, contentCount:number} data 话题数据
 * @prop {function} onClick 话题点击事件
 */
export const Topic = ({ data, onClick }) => {
  const click = useCallback(() => {
    onClick && onClick(data);
  }, [data, onClick]);

  const { threads = [] } = data;

// TODO 表情两行显示有问题
  return (
    <div className={styles.topic} onClick={click}>
      <div className={styles.title}>{`#${data.content}#` || '暂无内容'}</div>
      <div className={styles.content}>
        <FilterRichText onClick={click} className={styles.richText} content={replaceSearchResultContent(threads[0]?.content?.text || '暂无内容')} />
      </div>
      <div className={styles.tags}>
        <div className={styles.tag}>热度{data.viewCount || 0}</div>
        <div className={styles.tag}>内容{data.threadCount || 0}</div>
      </div>
    </div>
  );
};

/**
 * 帖子组件
 * @prop {object}   data 帖子数据
 * @prop {function} onClick 帖子点击事件
 * @prop {boolean}  divider 分割线
 */
// const click = useCallback(() => {
//   onClick && onClick(data);
// }, [data, onClick]);

// TODO: 帖子如何点击待处理 click
export const Post = ({ divider, ...props }) => (
  <div {...props}>
    <div>
      <ThreadContent />
    </div>
    {divider && <div className={styles.hr} />}
  </div>
);
