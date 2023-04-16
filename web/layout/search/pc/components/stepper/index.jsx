import React, { useCallback } from 'react';
import styles from './index.module.scss';
import { Icon } from '@discuzqsdk/design';
import { noop } from '@components/thread/utils';
import datas from './data';
import UnreadRedDot from '@components/unread-red-dot';
/**
 * 潮流话题
 * @prop {string[]} data 步骤数据
 * @prop {function} onItemClick 步骤点击事件
 * @prop {function} selectIndex 选中项index
 */
 const Stepper = ({ data = datas, onItemClick = noop, selectIndex = 0}) => (
  <div className={styles.container}>
    {data?.map((item, index, arr) => (
      <Steps
        key={index}
        index={index}
        data={item}
        onClick={onItemClick}
        selectIndex ={selectIndex}
        footer={arr.length - 1 === index}
      />
    ))}
  </div>
);


/**
* 步骤组件
* @prop {iconName:string, iconColor:string,content:string} data 步骤数据
* @prop {function} onClick 步骤点击事件
* @prop {number} index 步骤index
* @prop {number} selectIndex 选中步骤index
* @prop {boolean} footer 是否底部组件
*/
const Steps = ({ data, onClick, selectIndex, index, footer}) => {
const handleClick = useCallback(() => {
  onClick && onClick(index, data.iconName, data);
}, [index, data, onClick]);

return (
  <div className={styles.stepsItem} onClick={handleClick}>
    {
      footer ? null : (<div className={styles.line}></div>)
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
    <Icon className={styles.icon} name={data.iconName} size={20} color={`${selectIndex === index ? '#2469f6' : data.iconColor}`}/>
      <div className={`${styles.content} ${selectIndex === index ? styles.itemActive : ''}`}>
        <UnreadRedDot type="text" unreadCount={data?.unreadCount}>{data.content}</UnreadRedDot>
      </div>
  </div>
);
};
export default React.memo(Stepper);
