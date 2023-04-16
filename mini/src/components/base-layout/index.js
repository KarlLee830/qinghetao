import React,  { useEffect, useRef, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { View } from '@tarojs/components';
import Header from '../header';
import List from '../list'
import BottomNavBar from '../bottom-nav-bar'
import { useDidShow } from '@tarojs/taro'
import Taro from '@tarojs/taro';
import { throttle } from '@common/utils/throttle-debounce.js';

import styles from './index.module.scss';

/**
* PC端集成布局组件
* @prop {function} children 内容区域中间视图组件
* @prop {function} showHeader 是否显示头部组件
* @prop {function} showTabBar 是否显示底部tabBar组件
* @prop {function} showPullDown 是否集成下拉刷新
* @prop {function} onPullDown 下拉刷新事件
* @prop {function} isFinished 是否完成下拉刷新
* @prop other List Props // List组件所有的属性
* @example 
*     <BaseLayout>
        {(props) => <View>中间</View>}
      </BaseLayout>
*/

const BaseLayout = (props) => {
  const { 
    index, 
    showHeader = true, 
    showTabBar = false, 
    showPullDown = false, 
    children = null, 
    onPullDown, 
    isFinished = true, 
    curr, 
    onScroll = () => {}, 
    baselayout, 
    pageName, 
    onClickTabBar = () => {},
    listClassName = '', // 用于list组件className的定义
  } = props;

  const [showShadow, setShowShadow] = useState(false); // 用于修补ios视频全屏后会跳到顶部
  const [osPlatform, setOsPlatform] = useState("");

  // 避免小程序通过手势返回上一页时，无法重置参数
  useDidShow(() => {
    index.setHiddenTabBar(false)
    index.setHasOnScrollToLower(true)
  })

  // const pullDownWrapper = useRef(null)
  const listRef = useRef(null);

  // useEffect(() => {
  //   console.log(`pullDownWrapper`, pullDownWrapper)
  //   if (pullDownWrapper?.current) {
  //     setHeight(pullDownWrapper.current.clientHeight)
  //   }

  // }, [])

  useEffect(() => {
    if(!osPlatform) {
      const res = Taro.getSystemInfoSync();
      const { platform } = res;
      setOsPlatform(platform);
    }

    if(baselayout.videoFullScreenStatus === "inFullScreen") {
      if(osPlatform === 'ios') {
        setShowShadow(true); // 增加一层黑色遮罩用于推出全屏后跳转
        setTimeout(() => { // 关闭遮罩的兜底
          setShowShadow(false)
        }, 3000);
      }
    } else if (baselayout.videoFullScreenStatus === "offFullScreen" &&
        pageName && baselayout[pageName] > 0) {
      listRef.current.jumpToScrollTop(baselayout[pageName]);
      if(osPlatform === 'ios') setShowShadow(false); // 跳转完成后移除遮罩
      baselayout.videoFullScreenStatus = "";
    }
  }, [osPlatform, baselayout.videoFullScreenStatus])

  const handleScroll = throttle((e) => {

    onScroll(e);

    const { baselayout } = props;
    const playingVideoDom = baselayout.playingVideoDom;
    const playingAudioDom = baselayout.playingAudioDom;

    if (e?.detail?.scrollTop && pageName) baselayout[pageName] = e.detail.scrollTop;
    
    if (playingVideoDom || playingAudioDom) {
      Taro.getSystemInfo({
        success(res) {
  
          if (playingVideoDom) {
            Taro.createSelectorQuery()
            .select(`#${playingVideoDom}`)
            .boundingClientRect((rect) => { 
              if(rect.top > res.windowHeight || rect.bottom < 0) {
                Taro.createVideoContext(playingVideoDom)?.pause();
                baselayout.playingVideoDom = "";
              }
            }).exec();
          }
  
          if(playingAudioDom) {
            Taro.createSelectorQuery()
              .select(`#${baselayout?.playingAudioWrapperId}`)
              .boundingClientRect((rect) => {
              if(rect.top > res.windowHeight || rect.bottom < 0) {
                baselayout.playingAudioDom.pause();
                baselayout.playingAudioDom = null;
              }
            }).exec();
          }
  
        }
      });
    }
  }, 50);

  return (
    <View className={styles.container}>
        {showShadow && <View className={styles.shadow}></View> }
        {showHeader && <Header />}
        {
          showPullDown ? (
            <View className={styles.list} ref={pullDownWrapper}>
              {/* <PullDownRefresh onRefresh={onPullDown} isFinished={isFinished} height={height}> */}
                  <List {...props} className={`${styles.listHeight} ${listClassName}`} ref={listRef} hasOnScrollToLower={index.hasOnScrollToLower} onScroll={handleScroll}>
                      {typeof(children) === 'function' ? children({ ...props }) : children}
                  </List>
              {/* </PullDownRefresh> */}
            </View>
          ) : (
            <List {...props} className={`${styles.list} ${listClassName}`} ref={listRef} hasOnScrollToLower={index.hasOnScrollToLower} onScroll={handleScroll}>
                {typeof(children) === 'function' ? children({ ...props }) : children}
            </List>
          )
        }

        {!showShadow && showTabBar && <BottomNavBar onClick={onClickTabBar} placeholder curr={curr} />}
    </View>
  );
};

export default inject('baselayout', 'index')(observer(BaseLayout));