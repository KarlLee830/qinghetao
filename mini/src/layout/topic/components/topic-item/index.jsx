import React, { useCallback } from 'react';
import ImageContent from '@components/thread/image-content';
import PostContent from '@components/thread/post-content';
import { handleAttachmentData, noop } from '@components/thread/utils';
import styles from './index.module.scss';
import { View, Text } from '@tarojs/components';

/**
 * 话题组件
 * @prop {object} data 话题数据
 * @prop {function} onClick 话题点击事件
 */
const TopicItem = ({ data, onClick }) => {
  const click = useCallback(() => {
    onClick && onClick(data);
  }, [data, onClick]);

  const {
    text = '',
    imageData = []
  } = handleAttachmentData(data?.threads[0]?.content);
  return (
    <View className={styles.item} onClick={click}>
      <View className={styles.title}>{data.content && `#${data.content}#`}</View>
      <PostContent content={text} className={styles.content} />
      <ImageContent imgData={imageData}/>
      <View className={styles.footer}>
        <View className={styles.numBox}>
          <Text className={styles.title}>热度</Text>
          {data.viewCount || 0}
        </View>
        <View className={styles.numBox}>
          <Text className={styles.title}>内容</Text>
          {data.threadCount || 0}
        </View>
      </View>
    </View>
  );
};

export default React.memo(TopicItem);
