import React, { useEffect, useState } from 'react';
import { Icon } from '@discuzqsdk/design';
import { noop } from '@components/thread/utils';
import styles from './index.module.scss';
import { withRouter } from 'next/router';
import SharePopup from '@components/thread/share-popup';
import isWeiXin from '@common/utils/is-weixin';


/**
 * 用户组件
 * @prop {string} title 话题标题
 * @prop {number} viewNum 热度
 * @prop {number} contentNum 内容数
 * @prop {function} onClick 全部话题点击事件
 */
const TopicHeader = ({ title, viewNum = 0, contentNum = 0, onShare = noop, router }) => {
  const [visible, setVisible] = useState(false)
  const [loadWeiXin, setLoadWeiXin] = useState(false)

  const goList = () => {
    router.push('/search/result-topic');
  }

  useEffect(() => {
    setLoadWeiXin(isWeiXin())
  }, [])

  const handleShare = (e) => {
    if (loadWeiXin) {
      setVisible(true)
    } else {
      onShare(e)
    }
  }

  const onClose = () => {
    setVisible(false)
  }

  return (
    <div className={styles.container} style={{ backgroundImage: `url('/dzq-img/topic-header.png')` }}>
      <div className={styles.title}>{title && `#${title}#`}</div>
      <ul className={styles.siteInfo}>
          <li>
            <span className={styles.text}>热度</span>
            <span className={styles.content}>{viewNum}</span>
          </li>
          <li className={styles.hr}></li>
          <li>
            <span className={styles.text}>内容数</span>
            <span className={styles.content}>{contentNum}</span>
          </li>
          <li className={styles.hr}></li>
          <li onClick={handleShare}>
            <Icon className={styles.shareIcon}name="ShareAltOutlined" size={14} />
            <span className={styles.text}>分享</span>
          </li>
          <li className={styles.hr}></li>
          <li onClick={goList}>
            <span className={styles.text}>全部话题</span>
            <Icon className={styles.rightIcon} name="RightOutlined" size={12} />
          </li>
        </ul>
        {loadWeiXin && <SharePopup visible={visible} onClose={onClose} />}
    </div>
  );
};

export default withRouter(React.memo(TopicHeader));
