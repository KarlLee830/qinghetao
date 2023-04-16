import React, { useCallback } from 'react';
import styles from './index.module.scss';
import { Icon } from '@discuzqsdk/design';
import { noop } from '@components/thread/utils';
import localData from './data';
import UnreadRedDot from '@components/unread-red-dot';
/**
 * 搜索页面右侧导航栏
 * @prop {string[]} data 步骤数据
 * @prop {function} onItemClick 步骤点击事件
 * @prop {number} selectIndex 选中项index
 */
const Stepper = ({ data = localData, onItemClick = noop, selectIndex = 0}) => {

  const handleClick = useCallback((index, item) => {
    typeof onItemClick === 'function' && onItemClick(index, item.iconName, item);
  }, [data]);

  return (
    <div className={styles.container}>
      {data?.map((item, index, arr) => (
        <div key={index} className={styles.stepsItem} onClick={() => handleClick(index, item)}>

          {
            arr.length - 1 === index ? null : (<div className={styles.line}></div>)
          }

          {
            selectIndex === index ? (
              <div className={styles.circleBox}>
                <div className={styles.innerRing}></div>
              </div>
            ) : (
              <div className={styles.circle}></div>
            )
          }
          <Icon className={styles.icon} name={item.iconName} size={20} color={`${selectIndex === index ? '#2469f6' : item.iconColor}`}/>
          <div className={`${styles.content} ${selectIndex === index ? styles.itemActive : ''}`}>{item.content}</div>

          {/* 渲染未读消息红点 */}
          {!!item.unreadCount && (
            <div className={styles.badgeMargin}>
              <UnreadRedDot unreadCount={item.unreadCount}></UnreadRedDot>
            </div>
          )}

        </div>
      ))}
    </div>
  )
};

export default React.memo(Stepper);
