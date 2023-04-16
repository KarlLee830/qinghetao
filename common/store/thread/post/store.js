/**
 * 创建帖子页面的 Store
 */
import { observable, computed } from 'mobx';
import { LOADING_TOTAL_TYPE, THREAD_STATUS } from '@common/constants/thread-post';
import { plus } from '@common/utils/calculate';
import { initPostData } from './common';

class ThreadPostStore {
  // 鼠标索引位置
  @observable cursorPosition = 0;
  /**
   * 表情列表
   */
  @observable emojis = [];
  /**
   * 商品信息
   */
  @observable product = {};
  /**
   * 推荐的话题列表，选择话题的时候需要
   */
  @observable topics = [];
  @observable topicTotalCount = 0;
  @observable showNewTopic = false;
  /**
   * 我的关注
   */
  @observable follows = [];
  @observable followsTotalCount = 0;
  /**
   * 加载状态
   */
  @observable loading = {
    [LOADING_TOTAL_TYPE.product]: false,
    [LOADING_TOTAL_TYPE.topic]: false,
    [LOADING_TOTAL_TYPE.emoji]: false,
    [LOADING_TOTAL_TYPE.follow]: false,
  };

  /**
   * 发帖相关数据
   */
  @observable postData = { ...initPostData };

  // 针对于红包和悬赏帖子，如果不是草稿了说明已经支付了，已经支付的帖子不支持红包和悬赏的编辑
  @computed get isThreadPaid() {
    return (
      this.postData.threadId && !this.postData.isDraft && (this.postData.redpacket.id || this.postData.rewardQa.id)
    );
  }

  @computed get payTotalMoney() {
    return plus(this.postData.price, this.postData.attachmentPrice);
  }

  @observable
  categorySelected = {
    // 选中的帖子类别
    parent: {}, // 选中的帖子父类
    child: {}, // 选中的帖子子类
  };

  // 当前选择的工具栏
  @observable
  currentSelectedToolbar = false;

  @computed get redpacketTotalAmount() {
    // 计算红包总额
    const { rule = 1, price = 0, number } = this.postData.redpacket;
    return rule === 1 ? parseFloat(price).toFixed(2) : (parseFloat(price) * parseInt(number)).toFixed(2);
  }

  @observable
  navInfo = {
    statusBarHeight: 44, // 默认的状态栏高度
    navHeight: 40, // 默认的导航栏高度
    menubtnWidth: 80, // 胶囊按钮的宽度
  };

  // 发帖的种类信息和查看帖子的分类不一样。所属权限不一样。所以发帖的类型单独处理
  @observable categories = [];

  @observable threadStatus = THREAD_STATUS.create;

  @observable isHaveLocalData = false; // 是否有本地缓存数据

  @observable editorHintAtKey = ''; // 编辑器针对艾特的数据同步
  @observable editorHintTopicKey = '';

  /**
   * 部分付费信息,用于存储操作时的数据
   */
  @observable partPayInfo = {
    textFreeValue: '',
    payPrice: '',
    selectedImages: [],
    selectedAttachments: [],
    selectedVideo: [],
    selectedAudio: [],
  };

  @observable filesPriceList = [];

  @observable videoPriceList = [];

  @observable audioPriceList = [];

  @observable imagesPriceList = [];
}

export default ThreadPostStore;
