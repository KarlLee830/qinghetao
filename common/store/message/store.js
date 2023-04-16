import { observable, computed } from 'mobx';
import { get } from '../../utils/get';

class MessageStore {
  initList = {
    list: [],
    currentPage: 0,
    totalPage: 1,
    totalCount: 0,
  };

  /**
   * 总的未读消息
   */
  @observable totalUnread = 0;

  /**
   * 私信未读消息
   */
  @observable dialogMessageUnread = 0;

  /**
   * 帖子通知未读消息
   */
  @observable threadUnread = 0;

  /**
   * 财务通知未读消息
   */
  @observable financialUnread = 0;

  /**
   * 账号消息未读消息
   */
  @observable accountUnread = 0;

  /**
   * at我的未读消息
   */
  @observable atUnread = 0;

  /**
   * 回复我的未读消息
   */
  @observable replyUnread = 0;

  /**
   * 点赞我的未读消息
   */
  @observable likeUnread = 0;

  /**
   * 私信对话列表
   */
  @observable dialogList = this.initList;

  /**
   * 单个私信对话内的消息列表
   */
  @observable dialogMsgList = this.initList;

  /**
   * 单个私信对话内的消息列表
   */
  @computed get dialogMsgListLength() {
    return this.dialogMsgList.totalCount;
  }

  /**
   * 财务通知列表
   */
  @observable financialMsgList = this.initList;

  /**
   * 账号消息列表
   */
  @observable accountMsgList = this.initList;

  /**
   * at我的消息列表
   */
  @observable atMsgList = this.initList;

  /**
   * 回复我的消息列表
   */
  @observable replyMsgList = this.initList;

  /**
   * 点赞我的消息列表
   */
  @observable likeMsgList = this.initList;

  /**
   * 帖子通知列表
   */
  @observable threadMsgList = this.initList;
}

export default MessageStore;
