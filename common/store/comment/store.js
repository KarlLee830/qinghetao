import { observable, computed } from 'mobx';

class CommentStore {
  constructor(props) {
    this.commentDetail = props?.comment;
  }
  @observable postId = null; // 回复id
  @observable commentDetail = null; // 评论信息
  @observable threadId = null; // 评论信息
  @observable authorInfo = null; // 作者信息
  @observable isAuthorInfoError = false;

  // 保障小程序启用滑动验证码，跳转其它小程序后再回来，数据不丢失
  @observable postValue = ''; // 评论、回复内容
  @observable postImageList = [];  // 评论、回复图片
  
  // 标记正在使用滑块验证码的目标
  @observable captchaMark = 'post';

  // 回复列表
  @computed get replyList() {
    return this.commentDetail?.commentPosts || [];
  }

  // 是否评论数据准备好
  @computed get isReady() {
    return !!this.commentDetail?.id;
  }

  // 内容
  @computed get content() {
    return this.commentDetail?.content;
  }
}

export default CommentStore;
