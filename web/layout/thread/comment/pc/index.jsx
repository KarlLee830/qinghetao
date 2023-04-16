import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import Router from '@discuzqsdk/sdk/dist/router';
import styles from './index.module.scss';
import AuthorInfo from '../../pc/components/author-info/index';
import CommentList from '../../pc/components/comment-list/index';
import Recommend from '@components/recommend';
import Header from '@components/header';
import { Icon, Toast } from '@discuzqsdk/design';
import LoadingTips from '@components/thread-detail-pc/loading-tips';
import RewardDisplay from '@components/thread-detail-pc/reward-display';
import RedPacketDisplay from '@components/thread-detail-pc/red-packet-display';
import DeletePopup from '@components/thread-detail-pc/delete-popup';
import NoMore from '../../pc/components/no-more';
import goToLoginPage from '@common/utils/go-to-login-page';
import HOCTencentCaptcha from '@middleware/HOCTencentCaptcha';


@inject('site')
@inject('user')
@inject('comment')
@inject('thread')
@observer
class CommentPCPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      commentSort: true, // ture 评论从旧到新 false 评论从新到旧
      showDeletePopup: false, // 是否弹出删除弹框
      showReplyDeletePopup: false, // 是否弹出回复删除弹框
      commentId: null, // 当前点击的commentid
    };

    this.commentData = null;
    this.replyData = null;


    this.positionRef = React.createRef();
    this.isPositioned = false;
  }

  componentDidUpdate() {
    // 滚动到指定的评论定位位置
    if (this.props.comment?.postId && !this.isPositioned && this.positionRef?.current) {
      this.isPositioned = true;
      setTimeout(() => {
        this.positionRef.current.scrollIntoView();
      }, 1000);
    }
  }

  // 返回
  onBackClick() {
    this.props.router.back();
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
      id: data.id,
      isLiked: !data.isLiked,
    };
    const { success, msg } = await this.props.comment.updateLiked(params, this.props.thread);

    if (success) {
      this.props.comment.setCommentDetailField('isLiked', params.isLiked);
      const likeCount = params.isLiked ? data.likeCount + 1 : data.likeCount - 1;
      this.props.comment.setCommentDetailField('likeCount', likeCount);
    }

    if (!success) {
      Toast.error({
        content: msg,
      });
    }
  }

  // 点击关注
  onFollowClick() {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    if (this.props.comment?.commentDetail?.userId) {
      this.props.comment?.authorInfo?.follow === 2 || this.props.comment?.authorInfo?.follow === 1
        ? this.props.comment.cancelFollow({ id: this.props.comment.commentDetail.userId, type: 1 }, this.props.user)
        : this.props.comment.postFollow(this.props.comment.commentDetail.userId, this.props.user);
    }
  }

  // 点击回复的赞
  async replyLikeClick(reply) {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    if (!reply.id) return;

    const params = {
      id: reply.id,
      isLiked: !reply.isLiked,
    };
    const { success, msg } = await this.props.comment.updateLiked(params, this.props.thread);

    if (success) {
      this.props.comment.setReplyListDetailField(reply.id, 'isLiked', params.isLiked);
      const likeCount = params.isLiked ? reply.likeCount + 1 : reply.likeCount - 1;
      this.props.comment.setReplyListDetailField(reply.id, 'likeCount', likeCount);
    }

    if (!success) {
      Toast.error({
        content: msg,
      });
    }
  }

  // 点击评论的删除
  async deleteClick() {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    this.commentData = this.props.comment.commentDetail;
    this.setState({
      showDeletePopup: true,
    });
  }

  // 删除评论
  async deleteComment() {
    if (!this.commentData.id) return;

    const { success, msg } = await this.props.comment.delete(this.commentData.id, this.props.thread);
    this.setState({
      showDeletePopup: false,
    });
    if (success) {
      Toast.success({
        content: '删除成功',
      });
      const { threadId } = this.props.comment;
      threadId && this.props.router.push(`/thread/${threadId}`);
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

    const params = {};
    if (this.replyData && this.commentData) {
      params.replyData = this.replyData; // 本条回复信息
      params.commentData = this.commentData; // 回复对应的评论信息
    }
    const { success, msg } = await this.props.comment.deleteReplyComment(params, this.props.thread);
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
      commentId: null,
    });
  }

  // 创建回复评论+回复回复接口
  async createReply(val, imageList) {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    const valuestr = val.replace(/\s/g, '');
    // 如果内部为空，且只包含空格或空行
    if (!(valuestr || imageList.length)) {
      Toast.info({ content: '请输入内容' });
      return;
    }

    const { threadId: id } = this.props.comment;
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

    const { success, msg, isApproved } = await this.props.comment.createReply(params, this.props.thread);

    if (success) {
      this.setState({
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

  // 点击发送私信
  onPrivateLetter() {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    const { id: userId, nickname } = this.props.comment?.authorInfo;
    if (!userId) return;
    Router.push({ url: `/message?page=chat&userId=${userId}&nickname=${nickname}` });
  }

  onUserClick(userId) {
    if (!userId) return;
    Router.push({ url: `/user/${userId}` });
  }


  onGotoThread = () => {
    const { threadId } = this.props.comment;
    this.props.router.push(`/thread/${threadId}`);
  }

  render() {
    const { commentDetail: commentData, isReady, isAuthorInfoError } = this.props.comment;
    const isSelf = this.props.user?.userInfo?.id && this.props.user?.userInfo?.id === commentData?.userId;
    const { isAnonymous } = this.props.thread?.threadData || '';
    const { query } = this.props.router;
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Header></Header>
        </div>

        <div className={styles.body}>
          {/* 左边内容和评论 */}
          <div>
            <div className={styles.bodyLeft}>
              {/* 头部 */}
              <div className={styles.bodyLeftHeader}>
                <div className={styles.back} onClick={() => this.onBackClick()}>
                  <Icon name="ReturnOutlined"></Icon>
                  <span className={styles.text}>返回</span>
                </div>
                <div className={styles.bodyHeaderOperate}>
                  {this.props.comment?.rewards ? (
                    <div className={styles.reward}>
                      <RewardDisplay number={this.props.comment.rewards}></RewardDisplay>
                    </div>
                  ) : (
                    ''
                  )}
                  {this.props.comment?.redPacketAmount ? (
                    <div className={styles.redpacket}>
                      <RedPacketDisplay number={this.props.comment.redPacketAmount}></RedPacketDisplay>
                    </div>
                  ) : (
                    ''
                  )}
                  {this.props.comment?.commentDetail?.canDelete && (
                    <div className={styles.delete} onClick={() => this.deleteClick()}>
                      <Icon name="DeleteOutlined"></Icon>
                      <span className={styles.text}>删除</span>
                    </div>
                  )}
                </div>
              </div>
              {/* 内容 */}
              {isReady ? (
                <CommentList
                  data={commentData}
                  likeClick={() => this.likeClick(commentData)}
                  replyClick={() => this.replyClick(commentData)}
                  deleteClick={() => this.deleteClick(commentData)}
                  replyLikeClick={reply => this.replyLikeClick(reply, commentData)}
                  replyReplyClick={reply => this.replyReplyClick(reply, commentData)}
                  replyDeleteClick={reply => this.replyDeleteClick(reply, commentData)}
                  avatarClick={userId => this.onUserClick(userId)}
                  isHideEdit={true}
                  isFirstDivider={true}
                  isShowInput={this.state.commentId === commentData.id}
                  onSubmit={(value, imageList) => this.createReply(value, imageList)}
                  threadId={this.props.thread?.threadData?.userId}
                  postId={this.props.comment.postId}
                  positionRef={this.positionRef}
                  isAnonymous={isAnonymous}
                  originThread={query.fromMessage ? <div className={styles.originThread} onClick={this.onGotoThread}>查看原帖</div> : false}
                ></CommentList>
              ) : (
                <LoadingTips type="init"></LoadingTips>
              )}
            </div>
            <NoMore empty={false}></NoMore>
          </div>

          {/* 右边信息 */}
          <div className={styles.bodyRigth}>
            <div className={styles.authorInfo}>
              {this.props.comment?.authorInfo ? (
                <AuthorInfo
                  user={this.props.comment?.authorInfo}
                  onFollowClick={() => this.onFollowClick()}
                  isShowBtn={!isSelf}
                  onPrivateLetter={() => this.onPrivateLetter()}
                  onPersonalPage={() => this.onUserClick(this.props.comment?.authorInfo?.id)}
                ></AuthorInfo>
              ) : (
                <LoadingTips isError={isAuthorInfoError} type="init"></LoadingTips>
              )}
            </div>
            <div className={styles.recommend}>
              <Recommend></Recommend>
            </div>
          </div>
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
        ></DeletePopup>
      </div>
    );
  }
}

export default withRouter(HOCTencentCaptcha(CommentPCPage));
