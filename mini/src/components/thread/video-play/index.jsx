import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import Video from '@discuzqsdk/design/dist/components/video/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import { noop } from '../utils';
import { View, Text, Image } from '@tarojs/components'
import { getElementRect, randomStr } from '../utils'
import Taro from '@tarojs/taro';
import calcVideoSize from '@common/utils/calc-video-size';

/**
 * 视频
  * 视频 - 需要付费时直接不展示
 * @prop {string | number} v_width 视频宽度
 * @prop {string | number} v_height 视频高度
 * @prop {string} coverUrl 封面图片
 * @prop {string} url 视频地址
 * @prop {string} time 总时长
 * @prop {number} status 视频状态
 * @prop {boolean} canViewVideo 是否具有查看权限
 */

//TODO 视频转码中和错误状态的蒙层样式有问题，需要调整
const Index = ({
  coverUrl,
  url,
  time,
  status = 0,
  changeHeight = noop,
  baselayout = {},
  v_width = null,
  v_height = null,
  relativeToViewport = true,
  updateViewCount = noop,
  canViewVideo = true,
}) => {
  let player = null;
  const videoId = useRef(`video${randomStr()}`);
  const [width, setWidth] = useState(null);
  const [height, setHeight] = useState(null);

  const onReady = (ins) => {
    player = ins;
  };

  const onPlay = (e) => {
    updateViewCount();
    if (baselayout) {

      // 暂停之前正在播放的视频
      if (baselayout.playingVideoDom) {
        if (baselayout.playingVideoDom !== e.target.id) {
          Taro.createVideoContext(baselayout.playingVideoDom)?.pause();
        }
      }

      // 暂停之前正在播放的音频
      if (baselayout.playingAudioDom) {
        baselayout.playingAudioDom.pause();
      }

      if (baselayout.playingAudioDom) {
        if (baselayout.playingAudioDom !== e.target.id) {
          baselayout.playingAudioDom.pause();
        }
      }

      baselayout.playingVideoDom = e.target.id;

    }
  }

  const onFullscreenChange = (e) => { // 该函数在进出全屏的时候各被调用一次
    e && e.stopPropagation();
    if (baselayout.videoFullScreenStatus === "") { // 第一次调用
      baselayout.videoFullScreenStatus = "inFullScreen";
    } else if (baselayout.videoFullScreenStatus === "inFullScreen") { //第二次调用
      baselayout.videoFullScreenStatus = "offFullScreen";
    }
  }

  useEffect(() => {
    if (relativeToViewport) {
      getElementRect(videoId.current).then(res => {
        const info = Taro.getSystemInfoSync();

        const { width, height } = calcVideoSize({
          parentWidth: res?.width || 343,
          v_width,
          v_height,
          viewHeight: info.windowHeight
        });
        setWidth(width);
        setHeight(height);

        changeHeight({ type: 'video', height })
      })
    }
  }, [relativeToViewport]);
  return (
    <View id={videoId.current} className={styles.container} style={{
      width: `${width}px`,
      height: `${height}px`
    }}>
      {
        width && url && (
          <Video
            className={styles.videoBox}
            onReady={onReady}
            onPlay={onPlay}
            onFullscreenChange={onFullscreenChange}
            // 列表页已经加载的视频，详情页载入的时候无法正常播放，这里还需要进一步的了解原因以及优化，目前只是加了随机数
            src={url.indexOf('?') > -1 ? `${url}&rd=${randomStr()}` : `${url}?rd=${randomStr()}`}
            width={`${width}px`}
            height={`${height}px`}
            poster={coverUrl}
            duration={time}
          />
        )
      }
      {/* 视频蒙层 有权限播放时隐藏 无权限播放时显示 */}
      {
        !canViewVideo && (
          <View
            className={styles.maskImage}
            style={!url && { backgroundImage: `url(${coverUrl})` }}
            onClick={() => Toast.warning({ content: '暂⽆权限播放视频' })}
          ></View>
        )
      }
      {/* 视频头部提示 视频状态异常时显示 */}
      {
        status !== 1 && (
          <View className={styles.payBox}>
            <View className={`${styles.alert} ${status === 0 ? styles.alertWarn : styles.alertError}`}>
              <Icon className={styles.tipsIcon} size={20} name={status === 0 ? 'TipsOutlined' : 'WrongOutlined'}></Icon>
              <Text className={styles.tipsText}>{status === 0 ? '视频正在转码中，转码成功后才能正常显示！' : '错误'}</Text>
            </View>
          </View>
        )
      }
    </View>
  );
};

export default inject('baselayout')(observer(Index));
