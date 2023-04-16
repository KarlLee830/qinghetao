import React, { useCallback, useMemo } from 'react';
import replaceSearchResultContent from '@common/utils/replace-search-result-content';
import { noop } from '@components/thread/utils';
import styles from './index.module.scss';
import FilterRichText from '@components/filter-rich-text'

export const TopicItem = ({ data, onClick = noop }) => {
    const click = (e) => {
      if (e.target.localName === 'a') {
        return
      }
      onClick && onClick(data);
    };
  
    const { threads = [] } = data

  // TODO 表情两行显示有问题
    return (
      <div className={styles.container} onClick={click}>
        <div className={styles.title}>{`#${data.content}#` || '暂无内容'}</div>
        <div className={styles.content}>
          <FilterRichText onClick={click} className={styles.richText} content={replaceSearchResultContent(threads[0]?.content?.text || '暂无内容')} />
        </div>
        <div className={styles.tags}>
          <div className={styles.tag}>热度 {data.viewCount || 0}</div>
          <span className={styles.dot}>·</span>
          <div className={styles.tag}>内容 {data.threadCount || 0}</div>
        </div>
      </div>
    );
};

export default React.memo(TopicItem);
