import React from 'react';
import style from './index.module.scss';
import { View } from '@tarojs/components';

class NoMoreDataTip extends React.Component {
  render() {
    return (
      <View className={style.no_more_data_tip}>
        <View className={style.left_line}></View>
        <View className={style.text_tip}>没有更多内容了</View>
        <View className={style.right_line}></View>
      </View>
    );
  }
}

export default NoMoreDataTip;
