import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import { Video, Icon, Toast } from '@discuzqsdk/design';
import { noop } from '../utils';
import calcVideoSize from '@common/utils/calc-video-size';

/**
 * 视频 - 需要付费时直接不展示
 * @prop {string | number} v_width 视频宽度
 * @prop {string | number} v_height 视频高度
 * @prop {string} coverUrl 封面图片
 * @prop {string} url 视频地址
 * @prop {string} time 总时长
 * @prop {number} status 视频状态
 * @prop {boolean} canViewVideo 是否具有查看权限
 */

const Index = ({
  coverUrl,
  url,
  time,
  status = 0,
  baselayout = {},
  v_width = null,
  v_height = null,
  onVideoReady = noop,
  updateViewCount = noop,
  canViewVideo = true,
}) => {
  let player = null;
  const ref = useRef();
  const [width, setWidth] = useState(null);
  const [height, setHeight] = useState(null);

  const onReady = (ins) => {
    player = ins;
  };

  const onPlay = (e) => {
    updateViewCount();
    if (player && e && baselayout) {
      // 暂停之前正在播放的音视频
      if (baselayout.playingVideoDom) {
        // 暂停之前正在播放的视频
        baselayout.pauseWebPlayingVideo(e.target);
      }

      if (baselayout.playingAudioDom) {
        // 暂停之前正在播放的音频
        baselayout.pauseWebPlayingAudio();
      }

      baselayout.playingVideoDom = e.target;
      baselayout.playingVideoPos = e.target?.parentNode?.parentNode?.parentNode?.offsetTop || -1;
    }
  }


  useEffect(() => {
    const rect = ref.current.getBoundingClientRect();
    const { width, height } = calcVideoSize({
      parentWidth: rect?.width || 343,
      v_width,
      v_height,
      viewHeight: window.innerHeight
    });

    // height容错
    const newHeight = (height === 'NaN' || !height) ? 0 : height

    setWidth(width);
    setHeight(newHeight);
  }, []);

  useEffect(() => {
    if (ref?.current?.clientHeight) {
      onVideoReady && onVideoReady();
    }
  }, [ref?.current?.clientHeight]);

  return (
    <div id="common-video-play" className={styles.container} style={{ width: `${width}px`, height: `${height}px` }} ref={ref}>
      {
        width && url && (
          <Video
            className={styles.videoBox}
            onReady={onReady}
            onPlay={onPlay}
            src={url}
            width={width}
            height={height}
            poster={coverUrl}
            duration={time}
            playsinline={true}
            preload='none'
          />
        )
      }
      {/* 视频蒙层 有权限播放时隐藏 无权限播放时显示 */}
      {
        !canViewVideo && (
          <div
            className={styles.maskImage}
            style={!url && { backgroundImage: `url(${coverUrl})` }}
            onClick={() => Toast.warning({ content: '暂⽆权限播放视频' })}
          ></div>
        )
      }
      {/* 视频头部提示 视频状态异常时显示 */}
      {
        status !== 1 && (
          <div className={styles.payBox}>
            <div className={`${styles.alert} ${status === 0 ? styles.alertWarn : styles.alertError}`}>
              <Icon className={styles.tipsIcon} size={20} name={status === 0 ? 'TipsOutlined' : 'WrongOutlined'}></Icon>
              <span className={styles.tipsText}>{status === 0 ? '视频正在转码中，转码成功后才能正常显示！' : '错误'}</span>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default inject('baselayout')(observer(Index));