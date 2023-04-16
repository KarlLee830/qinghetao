import React, { useRef } from 'react';
import { inject, observer } from 'mobx-react';
import { IMG_SRC_HOST } from '@common/constants/site';
import styles from './index.module.scss';
import Audio from '@discuzqsdk/design/dist/components/audio/index';
import { noop } from '../utils';
import { View, Image } from '@tarojs/components'
import Taro from '@tarojs/taro';
// import parAudioImg from '../../../../../web/public/dzq-img/pay-audio.png';

const parAudioImg = `${IMG_SRC_HOST}/assets/pay-audio.c99a58e762f9bb2b4c54bc59bf00a6b6613afd91.png`;

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
    if( audioContext && baselayout && audioWrapperRef) {

      // 暂停之前正在播放的视频
      if(baselayout.playingVideoDom) {
        Taro.createVideoContext(baselayout.playingVideoDom)?.pause();
      }

       // 暂停之前正在播放的音频
      if (baselayout.playingAudioDom) {
        if(baselayout.playingAudioWrapperId !== audioWrapperRef.current.uid) {
          baselayout.playingAudioDom?.pause();
          baselayout.playingAudioWrapperId = audioWrapperRef.current.uid;
        }
      }

      baselayout.playingAudioDom = audioContext;
      baselayout.playingAudioWrapperId = audioWrapperRef.current.uid;
    }
  };
  return (
    <View className={styles.container}>
      {
        isPay ? (
          <View className={styles.wrapper}>
            <Image src={parAudioImg} className={styles.payBox} onClick={onPay}></Image>
          </View>
        ) : <View ref={audioWrapperRef}><Audio src={url} onPlay={onPlay} disabled={!url} ref={audioRef}/></View>
      }
    </View>
  );
};

export default inject('baselayout')(observer(Index));
