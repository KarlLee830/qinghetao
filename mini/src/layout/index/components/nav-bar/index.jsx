import React, { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { View, Text } from '@tarojs/components';

/**
 * 导航栏
 * @prop {string} title
 */
const NavBar = forwardRef(({ title = 'Discuz! Q', isShow = true }, ref) => {
  const [statusBarHeight, setStatusBarHeight] = useState(20)
  const navBarHeight = useRef(64)

  const navBarStyle = useMemo(() => {
    const height = `${statusBarHeight + 44}px`
    return {
      // transform: `translateY(-${isShow ? 0 : height})`,
      display: isShow ? 'block' : 'none',
      height
    }
  }, [statusBarHeight, isShow])

  useImperativeHandle(
    ref,
    () => ({
      navBarHeight: navBarHeight.current,
    }),
  );

  useEffect(() => {
    try {
      const res = Taro.getSystemInfoSync()
      const height = res?.statusBarHeight || 20
      navBarHeight.current = 44 + height

      setStatusBarHeight(height)
    } catch (e) {
      // Do something when catch error
    }
  }, [])

  return (
    <View className={styles.container} style={navBarStyle}>
      <View style={{ height: statusBarHeight }} className={styles.statusBar}></View>
      <Text className={styles.navBar}>{title}</Text>
    </View>
  );
});

export default NavBar;
