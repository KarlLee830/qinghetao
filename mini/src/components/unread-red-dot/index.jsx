import React from 'react';
import { View } from '@tarojs/components';
import styles from './index.module.scss';
import classNames from 'classnames';
import Badge from '@discuzqsdk/design/dist/components/badge/index';


const Index = ({ children, unreadCount, type = '', style = {}, dotStyle = {} }) => {

  // 转换未读消息数
  const getUnReadCount = (count) => {
    return count > 99 ? '99+' : (count || null);
  };

  return (
    <View
      className={classNames({
        'normal-badge': true,
        'middle-badge': unreadCount > 9 && unreadCount < 100,
        'large-badge': unreadCount > 99,
        'avatar-badge': type === 'avatar',
      })}
      style={style}
    >
      {children}
      {unreadCount > 0 && (
        <View className={'badge__circle'} style={dotStyle}>
          {getUnReadCount(unreadCount)}
        </View>
      )}
    </View>
  );
};

export default Index;
