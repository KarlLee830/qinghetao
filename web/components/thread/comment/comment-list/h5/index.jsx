import React from 'react';
import { inject, observer } from 'mobx-react';
import { Toast } from '@discuzqsdk/design';
import CommentList from '@layout/thread/h5/components/comment-list/index';
import AboptPopup from '@layout/thread/h5/components/abopt-popup';
import comment from './index.module.scss';
import { parseContentData } from '@layout/thread/utils';
import InputPopup from '@layout/thread/h5/components/input-popup';
import DeletePopup from '@components/thread-detail-pc/delete-popup';
import goToLoginPage from '@common/utils/go-to-login-page';
import { debounce } from '@common/utils/throttle-debounce';
import Operate from '../../operate';

/**
 * 评论列表
 * 移动端不需要回复按钮 - disabledReply={true}
 * */
@inject('comment')
@inject('user')
@observer
class RenderCommentList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAboptPopup: false, // 是否弹出采纳弹框
      showCommentInput: false, // 是否弹出评论框
      commentSort: true, // true 评论从旧到新 false 评论从新到旧
      showDeletePopup: false, // 是否弹出删除弹框
      showReplyDeletePopup: false, // 是否弹出回复删除弹框

      inputText: '请输入内容', // 默认回复框placeholder内容
    };

    this.commentData = null;
    this.replyData = null;

    this.recordCommentLike = {
      // 记录当前评论点赞状态
      id: null,
      status: null,
    };
    this.recordReplyLike = {
      // 记录当前评论点赞状态
      id: null,
      status: null,
    };

    this.operate = new Operate({
      list: this.props.commentList,
      threadData: this.props.thread?.threadData,
    });
  }

  // 点击评论的赞
  async likeClick(data) {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    if (!data.id) return;

    if (this.recordCommentLike.id !== data.id) {
      this.recordCommentLike.status = null;
    }
    if (this.recordCommentLike.status !== data.isLiked) {
      this.recordCommentLike.status = data.isLiked;
      this.recordCommentLike.id = data.id;
    } else {
      return;
    }

    const params = {
      commentId: data.id,
      isLiked: !data.isLiked,
    };
    this.operate.updateList(this.props.commentList);
    const { success, msg } = await this.operate.updateLiked(params);

    if (!success) {
      Toast.error({
        content: msg,
      });
    }
  }

  // 点击回复的赞
  async replyLikeClick(reply, comment) {
    if (!reply.id) return;

    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    if (this.recordReplyLike.id !== reply.id) {
      this.recordReplyLike.status = null;
    }
    if (this.recordReplyLike.status !== reply.isLiked) {
      this.recordReplyLike.status = reply.isLiked;
      this.recordReplyLike.id = reply.id;
    } else {
      return;
    }

    const params = {
      commentId: comment.id,
      replyId: reply.id,
      isLiked: !reply.isLiked,
    };
    this.operate.updateList(this.props.commentList);
    const { success, msg } = await this.operate.updateLiked(params);

    if (!success) {
      Toast.error({
        content: msg,
      });
    }
  }

  // 点击评论的删除
  async deleteClick(data) {
    this.commentData = data;
    this.setState({
      showDeletePopup: true,
    });
  }

  // 删除评论
  async deleteComment() {
    if (!this.commentData.id) return;

    this.operate.updateList(this.props.commentList);
    const { success, msg } = await this.operate.delete({
      commentId: this.commentData.id,
    });
    this.setState({
      showDeletePopup: false,
    });
    if (success) {
      Toast.success({
        content: '删除成功',
      });
      typeof this.props.deleteComment === 'function' && this.props.deleteComment();
      return;
    }
    Toast.error({
      content: msg,
    });
  }

  // 点击回复的删除
  async replyDeleteClick(reply, comment) {
    this.commentData = comment;
    this.replyData = reply;
    this.setState({
      showReplyDeletePopup: true,
    });
  }

  // 删除回复
  async replyDeleteComment() {
    if (!this.replyData.id) return;

    this.operate.updateList(this.props.commentList);
    const { success, msg } = await this.operate.delete({
      commentId: this.commentData.id,
      replyId: this.replyData.id,
    });

    this.setState({
      showReplyDeletePopup: false,
    });
    if (success) {
      Toast.success({
        content: '删除成功',
      });
      return;
    }
    Toast.error({
      content: msg,
    });
  }

  // 点击评论的回复
  replyClick(comment) {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }
    if (!this.props.canPublish()) return;
    this.commentData = comment;
    this.replyData = null;
    const userName = comment?.user?.nickname || comment?.user?.userName;
    this.setState({
      showCommentInput: true,
      inputText: userName ? `回复${userName}` : '请输入内容',
    });
  }

  // 点击回复的回复
  replyReplyClick(reply, comment) {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }
    if (!this.props.canPublish()) return;
    this.commentData = null;
    this.replyData = reply;
    this.replyData.commentId = comment.id;
    const userName = reply?.user?.nickname || reply?.user?.userName;

    this.setState({
      showCommentInput: true,
      inputText: userName ? `回复${userName}` : '请输入内容',
    });
  }

  // 创建回复评论+回复回复接口
  async createReply(val = '', imageList = []) {
    const valuestr = val.replace(/\s/g, '');
    // 如果内部为空，且只包含空格或空行
    if (!valuestr && imageList.length === 0) {
      Toast.info({ content: '请输入内容' });
      return;
    }

    const id = this.props.thread?.threadData?.id;
    if (!id) return;

    const params = {
      id,
      content: val,
    };

    // 楼中楼回复
    if (this.replyData) {
      params.replyId = this.replyData.id;
      params.isComment = true;
      params.commentId = this.replyData.commentId;
      params.commentPostId = this.replyData.id;
    }
    // 回复评论
    if (this.commentData) {
      params.replyId = this.commentData.id;
      params.isComment = true;
      params.commentId = this.commentData.id;
    }

    if (imageList?.length) {
      params.attachments = imageList
        .filter((item) => item.status === 'success' && item.response)
        .map((item) => {
          const { id } = item.response;
          return {
            id,
            type: 'attachments',
          };
        });
    }

    this.operate.updateList(this.props.commentList);
    const { success, msg, isApproved } = await this.operate.createReply(params);

    if (success) {
      this.setState({
        showCommentInput: false,
        inputValue: '',
      });
      if (isApproved) {
        Toast.success({
          content: msg,
        });
      } else {
        Toast.warning({
          content: msg,
        });
      }
      return true;
    }

    Toast.error({
      content: msg,
    });
  }

  // 跳转评论详情
  onCommentClick(data) {
    if (data.id && this.props.thread?.threadData?.id) {
      this.props.router.push(`/thread/comment/${data.id}?threadId=${this.props.thread?.threadData?.id}`);
    }
  }

  // 点击采纳
  onAboptClick(data) {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    this.commentData = data;
    this.setState({ showAboptPopup: true });
  }

  // 悬赏弹框确定
  async onAboptOk(data) {
    if (data > 0) {
      const params = {
        postId: this.commentData?.id,
        rewards: data,
        threadId: this.props.thread?.threadData?.threadId,
      };
      this.operate.updateList(this.props.commentList);
      const { success, msg } = await this.operate.reward(params);
      if (success) {
        this.setState({ showAboptPopup: false });

        Toast.success({
          content: `悬赏${data}元`,
        });
        return true;
      }

      Toast.error({
        content: msg,
      });
    } else {
      Toast.info({
        content: '悬赏金额不能为0',
      });
    }
  }

  // 悬赏弹框取消
  onAboptCancel() {
    this.commentData = null;
    this.setState({ showAboptPopup: false });
  }

  // 点击头像
  avatarClick(data) {
    const { userId } = data;
    if (!userId) return;
    this.props.router.push(`/user/${userId}`);
  }

  // 点击回复头像
  replyAvatarClick(reply, comment, floor) {
    typeof this.props.replyAvatarClick === 'function' && this.props.replyAvatarClick(reply, comment, floor);
  }

  render() {
    const { commentList } = this.props;

    // 是否作者自己
    const isSelf =
      this.props.user?.userInfo?.id && this.props.user?.userInfo?.id === this.props.thread?.threadData?.userId;
    const isReward = this.props.thread?.threadData?.displayTag?.isReward;
    const { indexes } = this.props.thread?.threadData?.content || {};
    const { isAnonymous } = this.props.thread?.threadData || '';
    const parseContent = parseContentData(indexes);

    return (
      <>
        <div className={comment.body}>
          {commentList.map((val, index) => (
            <div
              className={`${comment.commentItems} ${index === commentList.length - 1 && comment.isLastOne}`}
              key={val.id || index}
            >
              <CommentList
                data={val}
                key={val.id}
                likeClick={debounce(() => this.likeClick(val), 500)}
                avatarClick={() => this.avatarClick(val)}
                replyClick={() => this.replyClick(val)}
                deleteClick={() => this.deleteClick(val)}
                editClick={() => this.editClick(val)}
                replyAvatarClick={(reply, floor) => this.replyAvatarClick(reply, val, floor)}
                replyLikeClick={debounce((reply) => this.replyLikeClick(reply, val), 500)}
                replyReplyClick={(reply) => this.replyReplyClick(reply, val)}
                replyDeleteClick={(reply) => this.replyDeleteClick(reply, val)}
                onCommentClick={() => this.onCommentClick(val)}
                onAboptClick={() => this.onAboptClick(val)}
                isShowOne={true}
                isShowAdopt={
                  // 是帖子作者 && 是悬赏帖 && 评论人不是作者本人
                  isSelf && isReward && this.props.thread?.threadData?.userId !== val.userId
                }
                threadId={this.props.thread?.threadData?.userId}
                isAnonymous={isAnonymous}
                disabledReply={true}
              ></CommentList>
            </div>
          ))}
        </div>

        {/* 评论弹层 */}
        <InputPopup
          visible={this.state.showCommentInput}
          inputText={this.state.inputText}
          onClose={() => this.setState({ showCommentInput: false })}
          onSubmit={(value, imgList) => this.createReply(value, imgList)}
          site={this.props.site}
        ></InputPopup>

        {/* 删除弹层 */}
        <DeletePopup
          visible={this.state.showDeletePopup}
          onClose={() => this.setState({ showDeletePopup: false })}
          onBtnClick={() => this.deleteComment()}
        ></DeletePopup>

        <DeletePopup
          visible={this.state.showReplyDeletePopup}
          onClose={() => this.setState({ showReplyDeletePopup: false })}
          onBtnClick={() => this.replyDeleteComment()}
        />

        {/* 采纳弹层 */}
        {parseContent?.REWARD?.money && parseContent?.REWARD?.remainMoney && (
          <AboptPopup
            money={Number(parseContent.REWARD.money)} // 悬赏总金额
            remainMoney={Number(parseContent.REWARD.remainMoney)} // 需要传入剩余悬赏金额
            visible={this.state.showAboptPopup}
            onCancel={() => this.onAboptCancel()}
            onOkClick={(data) => this.onAboptOk(data)}
          ></AboptPopup>
        )}
      </>
    );
  }
}

export default RenderCommentList;
