import React from 'react';
import { Icon } from '@discuzqsdk/design';
import { noop } from '@components/thread/utils';
import styles from './index.module.scss';
import Link from 'next/link';
import ThreadContent from '@components/thread';


/**
 * 用户组件
 * @prop {string} title 话题标题
 * @prop {number} viewNum 热度
 * @prop {number} contentNum 内容数
 * @prop {function} onClick 全部话题点击事件
 */
const TopicHeader = ({ title = '话题', viewNum = 0, contentNum = 0, onShare = noop }) => {
  return (
    <div className={styles.container} >
      <div className={styles.title}>{title && `#${title}#`}</div>
      <ul className={styles.siteInfo}>
          <li>
            <span className={styles.text}>共</span>
            <span className={styles.content}>{contentNum}</span>
            <span className={styles.text}>条内容</span>
          </li>
          <li>
            <span className={styles.text}>热度</span>
            <span className={styles.content}>{viewNum}</span>
          </li>
          <li onClick={onShare} className={styles.share}>
            <Icon className={styles.shareIcon} color="#8590a6" name="ShareAltOutlined"/>
            <span className={styles.text}>分享</span>
          </li>
          <li className={styles.allTopic}><Link href="/search/result-topic">全部话题</Link></li>
        </ul>
    </div>
  );
};

export default React.memo(TopicHeader);
