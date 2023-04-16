import { observable, computed } from 'mobx';

/**
 * 定位到指定评论位置相关数据
 */
class PositionCommentStore {
  @observable postId = null; // 评论id
  @observable commentList = null; // 评论列表数据
  @observable page = 1; // 列表页码
  @observable isCommentListError = false;
  @observable postsPositionPage = null; // 评论所在的列表页码

  // 是否评论数据准备好
  @computed get isCommentReady() {
    return !!this.commentList;
  }

  // 是否显示list
  @computed get isShowCommentList() {
    return this.postsPositionPage > 1;
  }

  // 是否还有更多
  @computed get isNoMore() {
    return this.page + 1 >= this.postsPositionPage;
  }
}

export default PositionCommentStore;
