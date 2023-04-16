import React, { useEffect, useState } from 'react';
import { Button, Icon, Spin } from '@discuzqsdk/design';
import { noop } from '../thread/utils';

import styles from './index.module.scss';

/**
 * 空数据页面
 * @prop {boolean} defaultShow 是否有展示延时
 * @prop {function} text 文字
 * @param {string} icon 图标
 * @prop {function} onClick 点击刷新按钮，触发事件
 * @prop {string} isShowBtn 是否显示刷新按钮
 * @prop {string} btnText 自定义刷新按钮文字
 */

const NoData = ({ defaultShow = false, className = '', text = '暂无数据', icon = '', onClick = noop, isShowBtn = false, btnText = '点击刷新' }) => {
  // 为了防止已进入页面，就出现暂无数据
  const [isHidden, setIsHidden] = useState(!defaultShow);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      setIsHidden(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.wrapper}>
        {icon && <Icon name={icon} size={48} className={styles.icon} />}
        {!isHidden && <span>{text}</span>}
      </div>
      {isShowBtn && <Button onClick={onClick}>{btnText}</Button>}
    </div>
  );
};

export default React.memo(NoData);
