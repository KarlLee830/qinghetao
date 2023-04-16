import React from 'react';
import { View, Text } from '@tarojs/components'
import styles from './header.module.scss';


const ExperienceHeader = () => (
  <View className={styles.container}>
      <View className={styles.rule}>
        <View className={styles.dot}>
          <Text></Text>
        </View>
        <View className={styles.text}>通过限时体验卡加入的用户，将被授权付费站点的查看权限，仅能查看站点仅30天内发布的内容。</View>
      </View>
      <View className={styles.rule}>
        <View className={styles.dot}>
          <Text></Text>
        </View>
        <View className={styles.text}>一个用户仅可使用体验卡一次，到期后需要付费加入。</View>
      </View>
  </View>
);

export default ExperienceHeader;
