const H5_TOP_INSTANCE = 52;
const H5_BOTTOM_INSTANCE = 65;
const PC_TOP_INSTANCE = 135;
const PC_BOTTOM_INSTANCE = 0;

/**
 * 视频自动播放
 */
class Autoplay {
  constructor(props = {}) {
    this.videoMap = {};
    // window.videoMap = this.videoMap;

    this.platform = props.platform || 'pc';

    this.topInstance = this.platform === 'pc' ? PC_TOP_INSTANCE : H5_TOP_INSTANCE;
    this.bottomInstance = this.platform === 'pc' ? PC_BOTTOM_INSTANCE : H5_BOTTOM_INSTANCE;
  }

  addVideo(key, element) {
    const newVideo = {
      key,
      element,
      isRecorded: this.videoMap[key]?.isRecorded || false,
      currentTime: this.videoMap[key]?.currentTime || 0,
      status: 'play',
      isFirst: true,
    };

    this.videoMap[key] = newVideo;

    this.addVideoEventListeneres(this.videoMap[key]);
  }

  deleteVideo(key) {
    this.videoMap[key] = null;
  }

  getVideo(key) {
    return this.videoMap[key];
  }

  // 获取正在播放的video
  getPlayingVideo() {
    let playingVideo;
    Object.values(this.videoMap).forEach((videoObj) => {
      if (videoObj?.status === 'play') {
        playingVideo = videoObj;
      }
    });

    return playingVideo;
  }

  // 添加监听事件
  addVideoEventListeneres = (videoObj) => {
    if (videoObj.element) {
      const recordVideo = () => {
        videoObj.isRecorded = true;
      };

      // 修改音量
      videoObj.element.addEventListener('volumechange', () => {
        if (!videoObj.element.muted) {
          recordVideo();
        }
      });

      // 拖动进度条
      videoObj.element.addEventListener('seeked', () => {
        if (videoObj.isFirst) {
          videoObj.isFirst = false;
        } else {
          recordVideo();
        }
      });
    }
  };

  // 检测视频播放
  checkVideoPlay = (startNum, stopNum) => {
    const videoObj = this.getPlayingVideo();
    const videoElement = videoObj?.element;
    if (videoElement) return;

    let index = startNum;
    while (index <= stopNum) {
      const videoObj = this.getVideo(index);
      const videoElement = document.querySelector(`div[data-index="${index}"] #common-video-play video`);

      if (videoElement && videoElement.play) {
        const { top, bottom } = videoElement.getBoundingClientRect();

        // 检查视频是否在当前可视区内
        if (top > this.topInstance && bottom < window.innerHeight - this.bottomInstance) {
          if (videoElement && videoElement.play) {
            videoElement.muted = true;
            videoElement.currentTime = videoObj?.currentTime || 0;
            videoElement.play();
            this.addVideo(index, videoElement);
            return;
          }
        }
      }
      index = index + 1;
    }
  };

  // 检测视频暂停
  checkVideoPlause = () => {
    const videoObj = this.getPlayingVideo();
    const videoElement = videoObj?.element;
    if (videoElement) {
      const { top, bottom } = videoElement.getBoundingClientRect();

      // 检查当前播放的视频是否在可视区外面
      if (top <= this.topInstance || bottom >= window.innerHeight - this.bottomInstance) {
        videoElement.pause();
        videoObj.status = 'pause';

        // 记录播放事件
        if (videoObj.isRecorded) {
          videoObj.currentTime = videoElement.currentTime;
          videoObj.element = null;
          return;
        }

        this.deleteVideo(videoObj.key);
      }
    }
  };
}

export default Autoplay;
