import { observable, computed } from 'mobx';
import htmlToString from '../../utils/html-to-string';
import s9e from '../../utils/s9e';
import { parseContentData } from '@layout/thread/utils';
import ThreadListStore from  '../thread-list/list';

class ThreadStore {
  constructor(props) {
    this.threadData = props?.thread;
    this.threadList = new ThreadListStore();
  }
  @observable threadData = null; // 帖子信息
  @observable hasRedPacket = 0 // 是否有可领取的红包信息

  @observable commentList = null; // 评论列表数据
  @observable page = null; // 评论列表page
  @observable totalCount = 0; // 评论列表总条数
  @observable totalPage = 0; // 评论总页数
  @observable authorInfo = null; // 作者信息
  @observable isPositionToComment = false; // 是否定位到评论位置
  @observable checkUser = null; // @ren数据

  @observable isCommentListError = false;
  @observable isAuthorInfoError = false;
  @observable contentImgLength = 0; // 内容区域的加载完成的图片的个数
  @observable scrollDistance = 0;
  @observable pageDataListType = null; // 记录使用了的是哪个列表数据

  // 是否帖子数据准备好
  @computed get isReady() {
    return !!this.threadData?.id;
  }

  // 是否评论数据准备好
  @computed get isCommentReady() {
    return !!this.commentList;
  }

  // 是否收藏
  @computed get isFavorite() {
    return !!this.threadData?.isFavorite;
  }

  // 是否加精
  @computed get isEssence() {
    return !!this.threadData?.displayTag?.isEssence;
  }

  // 是否没有更多
  @computed get isNoMore() {
    return this.page >= this.totalPage;
  }

  /**
   * 1. 若有帖子标题，则title为【帖子标题】
   * 2. 若无帖子标题，帖子正文包含文字内容，则展示文字内容前33字，第34字及以后为【...】
   * 3. 如果没有帖子文字标题 / 文字内容，则根据帖子包含的内容，对应展示：【图片/视频/语音/附件】- 【站点名称】
   */
  @computed get title() {
    // 标题
    const { title } = this.threadData || {};
    if (title) {
      return title;
    }

    // 文字内容
    const { text, indexes } = this?.threadData?.content || {};
    if (text) {
      const newText = s9e.parse(text)
      const parsedText = htmlToString(newText);
      if (parsedText) {
        return parsedText.length > 33 ? `${parsedText.slice(0, 33)}...` : parsedText;
      }
    }

    // 附件内容
    const parsedContent = parseContentData(indexes);
    const keys = Object.keys(parsedContent);
    if (keys?.length) {
      return keys
        .map((key) => {
          switch (key) {
            case 'VIDEO':
              return '视频';
            case 'IMAGE':
              return '图片';
            case 'RED_PACKET':
              return '红包';
            case 'REWARD':
              return '悬赏';
            case 'GOODS':
              return '商品';
            case 'VOICE':
              return '语音';
            case 'VOTE':
              return '附件';
          }
        })
        .filter(item => !!item)
        .join('/');
    }
  }
}

export default ThreadStore;
