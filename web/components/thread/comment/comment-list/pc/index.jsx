import React from 'react';
import { inject, observer } from 'mobx-react';
import comment from './index.module.scss';
import AboptPopup from '@layout/thread/pc/components/abopt-popup';
import CommentList from '@layout/thread/pc/components/comment-list/index';
import DeletePopup from '@components/thread-detail-pc/delete-popup';
import ReportPopup from '@layout/thread/pc/components/report-popup';
import { Toast } from '@discuzqsdk/design';
import classnames from 'classnames';
import goToLoginPage from '@common/utils/go-to-login-page';
import Router from '@discuzqsdk/sdk/dist/router';
import Operate from '../../operate';

const typeMap = {
  101: 'IMAGE',
  102: 'VOICE',
  103: 'VIDEO',
  104: 'GOODS',
  105: 'QA',
  106: 'RED_PACKET',
  107: 'REWARD',
  108: 'VOTE',
  109: 'QUEUE',
  110: 'FILE',
  111: 'QA_IMAGE',
};

// 评论列表
@inject('comment')
@inject('user')
@inject('site')
@observer
class RenderCommentList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAboptPopup: false, // 是否弹出采纳弹框
      showCommentInput: false, // 是否弹出评论框
      showDeletePopup: false, // 是否弹出删除弹框
      showReplyDeletePopup: false, // 是否弹出回复删除弹框
      showReportPopup: false,
      placeholder: '写下我的评论...', // 默认回复框placeholder内容
      commentId: null,
    };

    this.commentData = null;
    this.replyData = null;

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

    const params = {
      commentId: data.id,
      isLiked: !data.isLiked,
    };
    this.operate.updateList(this.props.commentList);
    const { success, msg } = await this.operate.updateLiked(params);

    if (success) {
      // TODO:
    }

    if (!success) {
      Toast.error({
        content: msg,
      });
    }
  }

  // 点击回复的赞
  async replyLikeClick(reply, comment) {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    if (!reply.id) return;

    const params = {
      commentId: comment.id,
      replyId: reply.id,
      isLiked: !reply.isLiked,
    };
    this.operate.updateList(this.props.commentList);
    const { success, msg } = await this.operate.updateLiked(params);

    if (success) {
      // TODO:
    }

    if (!success) {
      Toast.error({
        content: msg,
      });
    }
  }

  // 点击评论的删除
  async deleteClick(data) {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    this.commentData = data;
    this.setState({
      showDeletePopup: true,
    });
  }

  // 删除评论
  async deleteComment() {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

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
    if (!this.props.canPublish('reply')) return;
    this.commentData = comment;
    this.replyData = null;
    this.setState({
      showCommentInput: true,
      commentId: comment.id,
    });
  }

  // 点击回复的回复
  replyReplyClick(reply, comment) {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }
    if (!this.props.canPublish('reply')) return;
    this.commentData = null;
    this.replyData = reply;
    this.replyData.commentId = comment.id;

    this.setState({
      showCommentInput: true,
      commentId: null,
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

    const id = this.props.thread?.threadData?.threadId;
    if (!id) return;

    const params = {
      id,
      content: val,
    };

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
        commentId: null,
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
      Router.push({ url: `/thread/comment/${data.id}?threadId=${this.props.thread?.threadData?.id}` });
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
        postId: this.commentData.id,
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

  onUserClick(userId) {
    if (!userId) return;
    Router.push({ url: `/user/${userId}` });
  }

  // 举报
  reportClick(comment) {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    this.comment = comment;
    this.setState({ showReportPopup: true });
  }

  // 确定举报
  async onReportOk(val) {
    if (!val) {
      Toast.info({ content: '请选择或输入举报理由' });
      return;
    }

    const params = {
      threadId: this.props.thread.threadData.threadId,
      reason: val,
      userId: this.props.user.userInfo.id,
    };
    // 举报评论
    if (this.comment) {
      params.type = 2;
      params.postId = this.comment.id;
    } else {
      params.type = 1;
    }

    const { success, msg } = await this.operate.createReports(params);

    if (success) {
      Toast.success({
        content: '操作成功',
      });

      this.setState({ showReportPopup: false });
      return true;
    }

    Toast.error({
      content: msg,
    });
  }

  onReportCancel() {
    this.comment = null;
    this.setState({ showReportPopup: false });
  }

  replyAvatarClick(reply, comment, floor) {
    if (floor === 2) {
      const { userId } = reply;
      if (!userId) return;
      this.props.router.push(`/user/${userId}`);
    }
    if (floor === 3) {
      const { commentUserId } = reply;
      if (!commentUserId) return;
      this.props.router.push(`/user/${commentUserId}`);
    }
  }

  onFocus(e) {
    if (!this.props.user.isLogin()) {
      e && e.stopPropagation();
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }
    if (!this.props.canPublish('reply')) return;
    return true;
  }

  render() {
    const { commentList } = this.props;

    // 是否作者自己
    const isSelf =
      this.props.user?.userInfo?.id && this.props.user?.userInfo?.id === this.props.thread?.threadData?.userId;

    const isReward = this.props.thread?.threadData?.displayTag?.isReward;
    const { isAnonymous } = this.props.thread?.threadData || '';

    const { indexes } = this.props.thread?.threadData?.content || {};
    const parseContent = {};
    if (indexes && Object.keys(indexes)) {
      Object.entries(indexes).forEach(([, value]) => {
        if (value) {
          const { tomId, body } = value;
          parseContent[typeMap[tomId]] = body;
        }
      });
    }

    return (
      <div className={classnames(comment.container, !commentList?.length && comment.isEmpty)}>
        <div className={comment.body}>
          {commentList.map((val, index) => (
            <div
              className={`${comment.commentItems} ${index === commentList.length - 1 && comment.isLastOne}`}
              key={val.id || index}
            >
              <CommentList
                data={val}
                key={val.id}
                avatarClick={(userId) => this.onUserClick(userId)}
                replyAvatarClick={(reply, floor) => this.replyAvatarClick(reply, val, floor)}
                likeClick={() => this.likeClick(val)}
                replyClick={() => this.replyClick(val)}
                deleteClick={() => this.deleteClick(val)}
                replyLikeClick={(reply) => this.replyLikeClick(reply, val)}
                replyReplyClick={(reply) => this.replyReplyClick(reply, val)}
                replyDeleteClick={(reply) => this.replyDeleteClick(reply, val)}
                reportClick={() => this.reportClick(val)}
                onCommentClick={() => this.onCommentClick(val)}
                onSubmit={(val, imageList) => this.createReply(val, imageList)}
                isShowOne={true}
                isShowInput={this.state.commentId === val.id}
                onAboptClick={() => this.onAboptClick(val)}
                isShowAdopt={
                  // 是帖子作者 && 是悬赏帖 && 评论人不是作者本人
                  isSelf && isReward && this.props.thread?.threadData?.userId !== val.userId
                }
                threadId={this.props.thread.threadData.userId}
                isAnonymous={isAnonymous}
              ></CommentList>
            </div>
          ))}
        </div>

        {/* 删除弹层 */}
        <DeletePopup
          visible={this.state.showDeletePopup}
          onClose={() => this.setState({ showDeletePopup: false })}
          onBtnClick={() => this.deleteComment()}
        ></DeletePopup>

        {/* 删除回复弹层 */}
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

        {/* 举报弹层 */}
        <ReportPopup
          visible={this.state.showReportPopup}
          onCancel={() => this.onReportCancel()}
          onOkClick={(data) => this.onReportOk(data)}
        ></ReportPopup>
      </div>
    );
  }
}

export default RenderCommentList;
