import React from 'react';
import { View } from '@tarojs/components';
import styles from './index.module.scss';

export default ({type = 'error'}) => {
  const getErrorMsg = (v) => {
    let msg = '';
    switch(v) {
      case 'pay':
        msg = '站点需要付费加入'
      break;
      case 'permission':
        msg = '登录后才能查看'
        break;
      case 'error':
        msg = '数据异常'
      break;
    }
    return msg;
  }
  return (
    <View className={styles.loadingBox}>
      <View style={{textAlign: 'center'}}>{ getErrorMsg(type)}</View>
      <View style={{textAlign: 'center'}}>进入小程序了解精彩内容</View>
    </View>
  )
}