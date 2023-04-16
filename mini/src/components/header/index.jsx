import React, { useCallback } from 'react';
import styles from './index.module.scss';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Router from '@discuzqsdk/sdk/dist/router';
import browser from '@common/utils/browser';
import { View, Text } from '@tarojs/components'
import LoginHelper from '@common/utils/login-helper';

export default function H5Header(props) {
  const { isBackCustom } = props;
  // todo
  const iconClickHandle = useCallback((type) => {
    switch (type) {
      case 'home':
        LoginHelper.gotoIndex();
        break;
      case 'msg': Router.push({ url: '/my/notice' });
        break;
      case 'user': Router.push({ url: '/my' });
        break;
    }
  }, []);

  const gobackClickHandle = useCallback(() => {
    let isBack = true;
    if (typeof isBackCustom === 'function') isBack = isBackCustom();
    if (isBack) Router.back();
  }, []);

  return (
    <View className={styles.header}>
        <View className={styles.headerContent}>
            <View onClick={gobackClickHandle} className={styles.left}>
              <Icon className={browser.env('android') ? styles.icon : ''} name="LeftOutlined" size={16} />
              <View className={styles.text}>返回</View>
            </View>
            <View className={styles.right}>
                <Icon className={styles.icon} onClick={() => {
                  iconClickHandle('home');
                }} name="HomeOutlined" />
                <Icon className={styles.icon} onClick={() => {
                  iconClickHandle('msg');
                }} name="MailOutlined" />
                <Icon className={styles.icon} onClick={() => {
                  iconClickHandle('user');
                }} name="ProfessionOutlined" />
            </View>
        </View>
    </View>
  );
}
