import React from 'react';
import { inject, observer } from 'mobx-react';
import comment from './index.module.scss';
import AboptPopup from '../components/abopt-popup';
import CommentList from '../components/comment-list/index';
import CommentInput from '../components/comment-input/index';
import DeletePopup from '@components/thread-detail-pc/delete-popup';
import { Icon, Toast } from '@discuzqsdk/design';
import classnames from 'classnames';
import goToLoginPage from '@common/utils/go-to-login-page';
import Router from '@discuzqsdk/sdk/dist/router';
import HOCTencentCaptcha from '@middleware/HOCTencentCaptcha';


import { parseContentData } from '../../utils';


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
      commentSort: true, // ture 评论从旧到新 false 评论从新到旧
      showDeletePopup: false, // 是否弹出删除弹框
      showReplyDeletePopup: false, // 是否弹出回复删除弹框
      placeholder: '写下我的评论...', // 默认回复框placeholder内容
      commentId: null,
    };
    this.comment10Ref = React.createRef();
    this.commentData = null;
    this.replyData = null;
  }

  componentDidMount() {
    // 从首页评论点击更多进来，定位到第10条评论位置
    if (this.props?.thread?.isPositionToComment && this.comment10Ref.current) {
      this.comment10Ref.current.scrollIntoView();
    }
  }

  // 评论列表排序
  onSortClick = () => {
    this.setState({
      commentSort: !this.state.commentSort,
    });
    typeof this.props.sort === 'function' && this.props.sort(!this.state.commentSort);
  };

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
    const { success, msg } = await this.props.comment.updateLiked(params);

    if (success) {
      if (this.props.isPositionComment) {
        this.props.commentPosition.setReplyListDetailField(comment.id, reply.id, 'isLiked', params.isLiked);
        const likeCount = params.isLiked ? reply.likeCount + 1 : reply.likeCount - 1;
        this.props.commentPosition.setReplyListDetailField(comment.id, reply.id, 'likeCount', likeCount);
      } else {
        this.props.thread.setReplyListDetailField(comment.id, reply.id, 'isLiked', params.isLiked);
        const likeCount = params.isLiked ? reply.likeCount + 1 : reply.likeCount - 1;
        this.props.thread.setReplyListDetailField(comment.id, reply.id, 'likeCount', likeCount);
      }
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

  // 删除回复
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

  // 点击编辑
  editClick(comment) {
    typeof this.props.onEditClick === 'function' && this.props.onEditClick(comment);
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
        postId: this.commentData.id,
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

  onUserClick(userId) {
    if (!userId) return;
    Router.push({ url: `/user/${userId}` });
  }

  // 举报
  reportClick(comment) {
    typeof this.props.onReportClick === 'function' && this.props.onReportClick(comment);
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
    let { totalCount, commentList } = this.props.thread;

    const { commentList: commentPositionList, postId } = this.props.commentPosition;
    if (this.props.isPositionComment) {
      commentList = commentPositionList || [];
    }

    // 是否作者自己
    const isSelf = this.props.user?.userInfo?.id && this.props.user?.userInfo?.id === this.props.thread?.threadData?.userId;

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


    const { RED_PACKET } = parseContentData(indexes);
    const hasHongbao = RED_PACKET?.condition === 0 && RED_PACKET?.remainNumber > 0; // 是否为回复红包且还有剩余未领完红包

    return (
      <div className={classnames(comment.container, !totalCount && comment.isEmpty)}>
        {this.props.showHeader && (
          <div className={comment.header}>
            {totalCount ? (
              <div className={comment.number}>{totalCount}条评论</div>
            ) : (
              <div className={comment.number}>暂无评论</div>
            )}
            <div className={comment.sort} onClick={() => this.onSortClick()}>
              <Icon className={comment.sortIcon} name="SortOutlined" size={14}></Icon>
              <span className={comment.sortText}>{this.state.commentSort ? '评论从新到旧' : '评论从旧到新'}</span>
            </div>
          </div>
        )}

        {/* 输入框 */}
        {this.props.showHeader && (
          <div className={comment.input}>
            <CommentInput
              height="middle"
              onSubmit={(value, imageList) => this.props.onPublishClick(value, imageList)}
              initValue={this.state.inputValue}
              placeholder={this.state.placeholder}
              onFocus={e => this.onFocus(e)}
              onEmojiIconClick={() => this.onFocus()}
              onAtIconClick={() => this.onFocus()}
              onPcitureIconClick={() => this.onFocus()}
              hasHongbao={hasHongbao}
            ></CommentInput>
          </div>
        )}

        {/* 评论弹层 */}
        {/* <InputPopup
            visible={this.state.showCommentInput}
            onClose={() => this.onClose()}
            initValue={this.state.inputValue}
            onSubmit={value => this.onPublishClick(value)}
          ></InputPopup> */}

        <div className={comment.body}>
          {commentList.map((val, index) => (
            <div
              className={`${comment.commentItems} ${index === commentList.length - 1 && comment.isLastOne}`}
              key={val.id || index}
              ref={val.id === postId ? this.props.positionRef : null}
            >
              <div ref ={ index === 10 ? this.comment10Ref : null}>
                <CommentList
                  data={val}
                  key={val.id}
                  avatarClick={userId => this.onUserClick(userId)}
                  replyAvatarClick={(reply, floor) => this.replyAvatarClick(reply, val, floor)}
                  likeClick={() => this.likeClick(val)}
                  replyClick={() => this.replyClick(val)}
                  deleteClick={() => this.deleteClick(val)}
                  editClick={() => this.editClick(val)}
                  replyLikeClick={reply => this.replyLikeClick(reply, val)}
                  replyReplyClick={reply => this.replyReplyClick(reply, val)}
                  replyDeleteClick={reply => this.replyDeleteClick(reply, val)}
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
                  redPacketData = {RED_PACKET}
                  thread={this.props.thread}
                  threadId={this.props.thread.threadData.userId}
                  active={val.id === postId}
                  isAnonymous={isAnonymous}
                ></CommentList>
              </div>
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
            onOkClick={data => this.onAboptOk(data)}
          ></AboptPopup>
        )}
      </div>
    );
  }
}

RenderCommentList.defaultProps = {
  showHeader: true, // 是否显示排序头部
};

export default  HOCTencentCaptcha(RenderCommentList);
