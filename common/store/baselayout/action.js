import { action } from 'mobx';
import IndexStore from './store';

class IndexAction extends IndexStore {
  constructor(props) {
    super(props);
  }

  /**
   * 设置跳回页面头部
   */
  @action
  setJumpingToTop() {
    this.home = -1;
    this.search = -1;
    this.isJumpingToTop = true;
  }

  /**
   * 设置跳回页面头部
   */
  @action
  resetSearchResultScrolltop() {
    this.resultTopic = -1;
    this.resultUser = -1;
    this.resultPost = -1;
  }

  /**
   * 设置跳回页面头部
   */
  @action
  removeJumpingToTop() {
    this.isJumpingToTop = false;
  }

  /**
   * 重置播放器属性
   */
  @action
  resetPlayersInfo() {
    this.playingVideoPos = -1;
    this.playingVideoDom = "";
    this.playingAudioPos = -1;
    this.playingAudioDom = null;
    this.playingAudioWrapperId = "";
  }

  /**
   * 停止在播放的视频
   */
  @action
  pauseWebPlayingVideo(currentDom) {
    if(!this.playingVideoDom) return;
    if(currentDom) {
      if(currentDom.id === this.playingVideoDom.id) {
        return;
      }
    }
    this.playingVideoDom?.querySelector('video')?.pause();
    this.playingVideoDom = "";
    this.playingVideoPos = -1;
  }

  /**
   * 停止在播放的视频
   */
  @action
  pauseWebPlayingAudio(playingUrl) {
    if(!this.playingAudioDom) return;
    if(playingUrl) {
      if(this.playingAudioWrapperId === playingUrl) {
        return;
      }
    }
    this.playingAudioDom?.pause();
    this.playingAudioDom = null;
    this.playingAudioPos = -1;
    this.playingAudioWrapperId = "";
  }

}

export default IndexAction;
