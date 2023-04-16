import React from 'react';
import { Icon } from '@discuzqsdk/design';

import styles from './index.module.scss';

/**
 * 栏目头部
 * @prop {name: string, color: string {}} icon 图标 name: 名称 color: 颜色
 * @prop {string} title 标题
 * @prop {string} leftNum 左侧数字
 * @prop {boolean} bigSize 大尺寸头部
 * @prop {function} onShowMore 查看更多事件
 * @prop {boolean} isShowMore 是否显示更多
 * @prop {string} moreText 查看更多的文字
 * @prop {boolean} rightText 右侧描述文字
 */
const Index = ({ icon = {}, title, leftNum, onShowMore, isShowMore = true, rightText, bigSize = false, moreText = '更多', titleStyle = {} }) => (
  <div className={bigSize ? styles.wrapper : styles.container} style={titleStyle}>
    <div className={styles.left}>
      <Icon className={styles[`icon${icon.type}`]} name={icon.name} size={16} color={icon.color}/>
      <div className={`${styles.title} ${JSON.stringify(icon) === '{}' ? styles.noMargin : ''}`}>{title}</div>
      <div className={styles.num}>{leftNum}</div>
    </div>
    <div className={styles.right}>
      {
        isShowMore && (
          <div onClick={onShowMore} className={styles.more}>
          {moreText}
          <Icon className={styles.rightIcon} name="RightOutlined" size={10} />
        </div>
        )
      }
      <div className={styles.text}>{rightText}</div>
    </div>
  </div>
);

export default React.memo(Index);
