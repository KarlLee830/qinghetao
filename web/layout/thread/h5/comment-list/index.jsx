import React, { Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { Icon, Toast } from '@discuzqsdk/design';
import CommentList from '../components/comment-list/index';
import AboptPopup from '../components/abopt-popup';
import comment from './index.module.scss';
import { parseContentData } from '../../utils';
import InputPopup from '../components/input-popup';
import DeletePopup from '@components/thread-detail-pc/delete-popup';
import goToLoginPage from '@common/utils/go-to-login-page';
import { debounce } from '@common/utils/throttle-debounce';
import Router from '@discuzqsdk/sdk/dist/router';
import HOCTencentCaptcha from '@middleware/HOCTencentCaptcha';


// 评论列表
@inject('thread')
@inject('comment')
@inject('commentPosition')
@inject('user')
@inject('site')
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
  }

  // 评论列表排序
  onSortClick = async () => {
    if (typeof this.props.sort === 'function') {
      try {
        const success = await this.props.sort(!this.state.commentSort);
        if (success) {
          this.setState({
            commentSort: !this.state.commentSort,
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

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
      id: data.id,
      isLiked: !data.isLiked,
    };
    const { success, msg } = await this.props.comment.updateLiked(params, this.props.thread);

    if (success) {
      if (this.props.isPositionComment) {
        this.props.commentPosition.setCommentListDetailField(data.id, 'isLiked', params.isLiked);
        const likeCount = params.isLiked ? data.likeCount + 1 : data.likeCount - 1;
        this.props.commentPosition.setCommentListDetailField(data.id, 'likeCount', likeCount);
      } else {
        this.props.thread.setCommentListDetailField(data.id, 'isLiked', params.isLiked);
        const likeCount = params.isLiked ? data.likeCount + 1 : data.likeCount - 1;
        this.props.thread.setCommentListDetailField(data.id, 'likeCount', likeCount);
      }
    }

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
      id: reply.id,
      isLiked: !reply.isLiked,
    };
    const { success, msg } = await this.props.comment.updateLiked(params);

    if (this.props.isPositionComment) {
      this.props.commentPosition.setReplyListDetailField(comment.id, reply.id, 'isLiked', params.isLiked);
      const likeCount = params.isLiked ? reply.likeCount + 1 : reply.likeCount - 1;
      this.props.commentPosition.setReplyListDetailField(comment.id, reply.id, 'likeCount', likeCount);
    } else {
      this.props.thread.setReplyListDetailField(comment.id, reply.id, 'isLiked', params.isLiked);
      const likeCount = params.isLiked ? reply.likeCount + 1 : reply.likeCount - 1;
      this.props.thread.setReplyListDetailField(comment.id, reply.id, 'likeCount', likeCount);
    }

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
    const { success, msg } = await this.props.comment.delete(
      this.commentData.id,
      this.props.isPositionComment ? this.props.commentPosition : this.props.thread,
    );
    this.setState({
      showDeletePopup: false,
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

  // 点击回复的删除
  async replyDeleteClick(reply, comment) {
    this.commentData = comment;
    this.replyData = reply;
    this.setState({
      showReplyDeletePopup: true,
    });
  }

  // 删除回复评论
  async replyDeleteComment() {
    if (!this.replyData.id) return;

    const params = {};
    if (this.replyData && this.commentData) {
      params.replyData = this.replyData; // 本条回复信息
      params.commentData = this.commentData; // 回复对应的评论信息
    }
    const { success, msg } = await this.props.comment.deleteReplyComment(
      params,
      this.props.isPositionComment ? this.props.commentPosition : this.props.thread,
    );
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
    if (!this.props.canPublish('reply')) return ;
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
    if (!this.props.canPublish('reply')) return ;
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
        .filter(item => item.status === 'success' && item.response)
        .map((item) => {
          const { id } = item.response;
          return {
            id,
            type: 'attachments',
          };
        });
    }

    //  验证码
    const { webConfig } = this.props.site;
    if (webConfig) {
      const qcloudCaptcha = webConfig?.qcloud?.qcloudCaptcha;
      const createThreadWithCaptcha = webConfig?.other?.createThreadWithCaptcha;
      // 开启了腾讯云验证码验证时，进行验证，通过后再进行实际的发布请求

      if (qcloudCaptcha && createThreadWithCaptcha) {
        // 验证码票据，验证码字符串不全时，弹出滑块验证码
        const { captchaTicket, captchaRandStr } = await this.props.showCaptcha();
        if (!captchaTicket && !captchaRandStr) {
          return false ;
        }
        params.captchaTicket = captchaTicket;
        params.captchaRandStr = captchaRandStr;
      }
    }

    const { success, msg, isApproved } = await this.props.comment.createReply(
      params,
      this.props.isPositionComment ? this.props.commentPosition : this.props.thread,
    );

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

  // 点击编辑
  editClick(comment) {
    typeof this.props.onEditClick === 'function' && this.props.onEditClick(comment);
  }

  // 跳转评论详情
  onCommentClick(data) {
    if (data.id && this.props.thread?.threadData?.id) {
      Router.push({url: `/thread/comment/${data.id}?threadId=${this.props.thread?.threadData?.id}`});
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
      const { success, msg } = await this.props.thread.reward(params);
      if (success) {
        this.setState({ showAboptPopup: false });

        // 重新获取帖子详细
        this.props.thread.fetchThreadDetail(params.threadId);

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
    Router.push({url: `/user/${userId}`});
  }

  // 点击回复头像
  replyAvatarClick(reply, comment, floor) {
    typeof this.props.replyAvatarClick === 'function' && this.props.replyAvatarClick(reply, comment, floor);
  }

  render() {
    let { totalCount, commentList } = this.props.thread;

    const { commentList: commentPositionList, postId } = this.props.commentPosition;
    if (this.props.isPositionComment) {
      commentList = commentPositionList || [];
    }

    // 是否作者自己
    const isSelf =    this.props.user?.userInfo?.id && this.props.user?.userInfo?.id === this.props.thread?.threadData?.userId;
    const isReward = this.props.thread?.threadData?.displayTag?.isReward;
    const { indexes } = this.props.thread?.threadData?.content || {};
    const { isAnonymous } = this.props.thread?.threadData || '';
    const parseContent = parseContentData(indexes);

    return (
      <Fragment>
        {this.props.showHeader && (
          <div className={comment.header}>
            <div className={comment.number}>共{totalCount}条评论</div>
            <div className={comment.sort} onClick={() => this.onSortClick()}>
              <Icon className={comment.sortIcon} name="SortOutlined"></Icon>
              <span className={comment.sortText}>{this.state.commentSort ? '评论从新到旧' : '评论从旧到新'}</span>
            </div>
          </div>
        )}

        <div className={comment.body}>
          {commentList.map((val, index) => (
            <div
              className={`${comment.commentItems} ${index === commentList.length - 1 && comment.isLastOne}`}
              key={val.id || index}
              ref={val.id === postId ? this.props.positionRef : null}
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
                replyLikeClick={debounce(reply => this.replyLikeClick(reply, val), 500)}
                replyReplyClick={reply => this.replyReplyClick(reply, val)}
                replyDeleteClick={reply => this.replyDeleteClick(reply, val)}
                onCommentClick={() => this.onCommentClick(val)}
                onAboptClick={() => this.onAboptClick(val)}
                isShowOne={true}
                isShowAdopt={
                  // 是帖子作者 && 是悬赏帖 && 评论人不是作者本人
                  isSelf && isReward && this.props.thread?.threadData?.userId !== val.userId
                }
                thread={this.props.thread}
                threadId={this.props.thread?.threadData?.userId}
                active={val.id === postId}
                isAnonymous={isAnonymous}
                redPacketData = {parseContent?.RED_PACKET}
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
            onOkClick={data => this.onAboptOk(data)}
          ></AboptPopup>
        )}
      </Fragment>
    );
  }
}

RenderCommentList.defaultProps = {
  showHeader: true, // 是否显示排序头部
};

export default HOCTencentCaptcha(RenderCommentList);
