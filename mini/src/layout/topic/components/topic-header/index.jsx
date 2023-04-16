import React, { useCallback, useState } from 'react';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Dropdown from '@discuzqsdk/design/dist/components/dropdown/index';
import { noop } from '@components/thread/utils';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

/**
 * 话题头部组件
 */
const TopicHeader = ({ onClick = noop }) => {
  const menu = () => {
    return (
      <Dropdown.Menu>
        <Dropdown.Item id="1">热度</Dropdown.Item>
        <Dropdown.Item id="2">内容数</Dropdown.Item>
      </Dropdown.Menu>
    );
  }
  return (
    <View className={styles.container}>
      <View className={styles.title}>话题列表</View>
      {/* <Dropdown
        style={{ display: 'inline-block' }}
        menu={menu()}
        placement="right"
        arrow={false}
        trigger="click"
        onChange={onClick}
        className={styles.sortDropdown}
      >
        <Icon name="SortOutlined" size={18} color='#2469f6'/>
        排序
      </Dropdown> */}
    </View>
  );
};

export default React.memo(TopicHeader);
