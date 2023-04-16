import React from 'react';
import styles from './index.module.scss';
import classNames from 'classnames';

const Index = ({ children, unreadCount, type = '', style = {}, dotStyle = {} }) => {

  // 转换未读消息数
  const getUnReadCount = (count) => {
    return count > 99 ? '99+' : (count || null);
  };

  return (
    <div
      className={classNames({
        'normal-badge': true,
        'middle-badge': unreadCount > 9 && unreadCount < 100,
        'large-badge': unreadCount > 99,
        'text-badge': type === 'text',
        'avatar-badge': type === 'avatar',
      })}
      style={style}
    >
      {children}
      {unreadCount > 0 && (
        <div className={'badge__circle'} style={dotStyle}>
          {getUnReadCount(unreadCount)}
        </div>
      )}
    </div>
  );
};

export default Index;
