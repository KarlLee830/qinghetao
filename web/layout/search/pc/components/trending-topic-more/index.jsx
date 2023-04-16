import React, { useCallback, useMemo } from 'react';
import { Icon, RichText } from '@discuzqsdk/design';
import styles from './index.module.scss';
import { handleAttachmentData, noop } from '@components/thread/utils';
import replaceSearchResultContent from '@common/utils/replace-search-result-content';
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';
import TopicItem from '@components/topic-item'

/**
 * 潮流话题
 * @prop {string[]} data 话题数据
 * @prop {function} onItemClick 话题点击事件
 */
const TrendingTopics = ({ data = [], onItemClick }) => {

  return(
    <div className={styles.list}>
    {data?.map((item, index, arr) => (
      <TopicItem data={item} key={index}  />  
      // <Topic key={index} index={index} data={item} onClick={onItemClick} footer={arr.length - index < 3} />
    ))}
  </div>
)};


/**
 * 话题组件
 * @prop {title:string, content:string, hotCount:number, contentCount:number} data 话题数据
 * @prop {function} onClick 话题点击事件
 * @prop {number} index
 */
const Topic = ({ data, onClick = noop, index, footer }) => {
  const click = useCallback(() => {
    onClick && onClick(data);
  }, [data, onClick]);
  
  const { threads = [] } = data

  const {
    text = '暂无内容',
    imageData = []
  } = handleAttachmentData(data?.threads[0]?.content);

  return (
    <div className={styles.item} onClick={click}>
      <div className={styles.imgBox}>
        { imageData.length > 0 && imageData[0].url ? (
            <img alt="图片" className={styles.img} src={data.img}/>
          ) : `${data.content[0]}`
        }
      </div>
      <div className={styles.content}>
        <div className={styles.title}>{data.content ? `#${data.content}#`: '暂无标题'}</div>
        <div className={styles.num}>
          <div className={styles.numItem}>
            <Icon name="EyeOutlined" size={14} color="#8590A6" className={styles.numIcon}/>
            {data.viewCount}
          </div>
          <div className={styles.viewBox}>
            <Icon name="MessageOutlined" size={14} color="#8590A6" className={styles.numIcon}/>
            {data.threadCount}
          </div>
        </div>
        {
          text ? (
          // <PostContent content={text} className={styles.text} />
          <TopicItem data={data} key={index} platform='pc' />  
          ) : (
            <div className={styles.text}>{text || '暂无内容'}</div>
          )
        }
      </div>
    </div>
  );
};

export default React.memo(TrendingTopics);
