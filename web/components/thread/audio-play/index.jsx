import React, { useRef } from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import { Audio } from '@discuzqsdk/design';
import { noop } from '../utils';

/**
 * 语音
 * @prop {boolean} isPay 是否需要付费
 * @prop {string | number} money 付费金额
 * @prop {string} url 音频地址
 * @prop {function} goCheckAudio 音频点击事件
 */

const Index = ({ isPay = false, url, onPay = noop, baselayout, updateViewCount = noop }) => {

  const audioRef = useRef();
  const audioWrapperRef = useRef();

  const onPlay = () => {
    const audioContext = audioRef?.current?.getState()?.audioCtx;
    updateViewCount();
    if(audioContext && baselayout && audioRef && audioWrapperRef) {
      // 音频在帖子中间，要找到音频相对于BaseLayout的具体地址
      const threadTextHeight = audioWrapperRef?.current?.parentNode?.previousElementSibling?.offsetHeight || 0;
      const userInfoHeight = audioWrapperRef?.current?.parentNode?.parentNode?.previousElementSibling?.offsetHeight || 0;
      const threadPosition = audioWrapperRef?.current?.parentNode?.parentNode?.parentNode?.offsetTop || 0;
      const position = threadTextHeight + threadPosition + userInfoHeight;

      // 暂停之前正在播放的音视频
      if(baselayout.playingVideoDom) {
        // 暂停之前正在播放的视频
        baselayout.pauseWebPlayingVideo();
      }

      if(baselayout.playingAudioDom) {
        // 暂停之前正在播放的音频
        baselayout.pauseWebPlayingAudio(url);
      }

      baselayout.playingAudioPos = position > 0 ? position : -1;
      baselayout.playingAudioDom = audioContext;
      baselayout.playingAudioWrapperId = url;
    }

  };

  return (
    <div className={styles.container}>
      {
        isPay ? (
          <div className={styles.wrapper}>
            <img alt="音频播放" src='/dzq-img/pay-audio.png' className={styles.payBox} onClick={onPay}></img>
          </div>
        ) : <div ref={audioWrapperRef}><Audio src={url} onPlay={onPlay} disabled={!url} ref={audioRef}/></div>
      }
    </div>
  );
};

export default inject('baselayout')(observer(Index));
