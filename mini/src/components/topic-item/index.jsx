import React, { useCallback, useMemo } from 'react';
import replaceSearchResultContent from '@common/utils/replace-search-result-content';
import { noop, handleLink } from '@components/thread/utils';
import styles from './index.module.scss';
import { View, Text } from '@tarojs/components';
import Router from '@discuzqsdk/sdk/dist/router';
import FilterRichText from '@components/filter-rich-text'


export const TopicItem = ({ data, onClick = noop }) => {
    const click = useCallback((e, node) => {
      e && e.stopPropagation();
      const {url, isExternaLink } = handleLink(node)
      if(isExternaLink) return

      if (url) {
        Router.push({url})
      } else {
        onClick && onClick(data);
      }
    }, [data, onClick]);

    const { threads = [] } = data

  // TODO 表情两行显示有问题
    return (
      <View className={styles.container} onClick={click}>
        <View className={styles.title}>{`#${data.content}#` || '暂无内容'}</View>
        <View className={styles.content}>
          <FilterRichText onClick={click} className={styles.richText} content={replaceSearchResultContent(threads[0]?.content?.text || '暂无内容')} />

        </View>
        <View className={styles.tags}>
          <View className={styles.tag}>热度 {data.viewCount || 0}</View>
          <Text className={styles.dot}>·</Text>
          <View className={styles.tag}>内容 {data.threadCount || 0}</View>
        </View>
      </View>
    );
};

export default React.memo(TopicItem);
