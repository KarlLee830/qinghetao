import { observable } from 'mobx';
class IndexStore {
  constructor() {}

  @observable home = -1;  // 主页list位置

  @observable search = -1; // 搜索页面list位置

  @observable draft = -1;

  @observable isJumpingToTop = false;

  @observable playingVideoPos = -1;

  @observable playingVideoDom = ''; // Video的selector string

  @observable playingAudioPos = -1;

  @observable playingAudioDom = null; // 来自组件Audio的context

  @observable playingAudioWrapperId = ''; // 小程序用于定位，web用于记录当前播放的音频

  @observable videoFullScreenStatus = ''; // 视频全屏播放的状态

  @observable resultTopic = -1; // 搜索页面list位置 - 更多潮流话题

  @observable resultUser = -1; // 搜索页面list位置 - 更多活跃用户

  @observable resultPost = -1; // 搜索页面list位置 - 更多热门内容

  @observable h5SearchResult = -1; // H5搜索结果页面list位置 

  @observable topicDetail = -1; // 搜索页面list位置 - 话题列表

}

export default IndexStore;
