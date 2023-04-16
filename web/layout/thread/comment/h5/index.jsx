import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import Router from '@discuzqsdk/sdk/dist/router';
import styles from './index.module.scss';
import CommentList from '../../h5/components/comment-list/index';
import MorePopup from '../../h5/components/more-popup';
// import DeletePopup from '../../h5/components/delete-popup';
import DeletePopup from '@components/thread-detail-pc/delete-popup';
import Header from '@components/header';
import { Toast, Icon, Input } from '@discuzqsdk/design';
import InputPopup from '../../h5/components/input-popup';
import ReportPopup from '../../h5/components/report-popup';
import goToLoginPage from '@common/utils/go-to-login-page';
import footer from './footer.module.scss';
import OperationPopup from '../components/operation-popup';
import { debounce as immediateDebounce } from '@components/thread/utils';
import MorePopop from '@components/more-popop';
import h5Share from '@discuzqsdk/sdk/dist/common_modules/share/h5';
import SharePopup from '@components/thread/share-popup';
import isWeiXin from '@common/utils/is-weixin';
import HOCTencentCaptcha from '@middleware/HOCTencentCaptcha';


@inject('site')
@inject('card')
@inject('user')
@inject('comment')
@inject('thread')
@observer
class CommentH5Page extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      shareShow: false, // 分享弹窗
      isShowWeiXinShare: false,
      showReportPopup: false, // 举报弹框
      showMorePopup: false, // 是否弹出更多弹框
      showCommentInput: false, // 是否弹出评论框
      commentSort: true, // ture 评论从旧到新 false 评论从新到旧
      showDeletePopup: false, // 是否弹出删除弹框
      showReplyDeletePopup: false, // 是否弹出回复删除弹框
      showOperationPopup: false, // 是否弹出操作内容弹框
      inputText: '请输入内容', // 默认回复框placeholder内容
      showEmojis: false,
      showPicture: false,
    };

    this.commentData = null;
    this.replyData = null;
    this.operationData = null;
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

    // 举报内容选项
    this.reportContent = ['广告垃圾', '违规内容', '恶意灌水', '重复发帖'];
    this.inputText = '其他理由...';

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

  // 点击更多
  onMoreClick() {
    this.setState({ showMorePopup: true });
  }

  // 更多中的操作
  onOperClick = (type) => {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    this.setState({ showMorePopup: false });

    // 编辑
    if (type === 'edit') {
      // this.onEditClick(this.props.comment.commentDetail);
    }

    // 删除
    if (type === 'delete') {
      // this.commentData = this.state.commentData;
      this.setState({ showDeletePopup: true });
    }

    // 举报
    if (type === 'report') {
      this.setState({ showReportPopup: true });
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

  // 点击回复的赞
  async replyLikeClick(reply) {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    if (!reply.id) return;

    if (this.recordCommentLike.id !== reply.id) {
      this.recordCommentLike.status = null;
    }
    if (this.recordCommentLike.status !== reply.isLiked) {
      this.recordCommentLike.status = reply.isLiked;
      this.recordCommentLike.id = reply.id;
    } else {
      return;
    }

    const params = {
      id: reply.id,
      isLiked: !reply.isLiked,
    };
    const { success, msg } = await this.props.comment.updateLiked(params, this.props.comment);

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
  async deleteClick(data) {
    this.commentData = data;
    this.setState({
      showDeletePopup: true,
    });
  }

  // 确定删除
  onBtnClick() {
    this.deleteComment();
    this.setState({ showDeletePopup: false });
  }

  // 删除评论
  async deleteComment() {
    if (!this.props?.comment?.commentDetail?.id) return;
    const { success, msg } = await this.props.comment.delete(this.props.comment.commentDetail.id, this.props.thread);
    this.setState({
      showDeletePopup: false,
    });
    if (success) {
      Toast.success({
        content: '删除成功',
      });
      Router.back();
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
    if (!this.props.canPublish('reply')) return ;
    this.commentData = comment;
    this.replyData = null;
    this.setState({
      showCommentInput: true,
      inputText: comment?.user?.nickname ? `回复${comment.user.nickname}` : '请输入内容',
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
      inputText: reply?.user?.nickname ? `回复${reply.user.nickname}` : '请输入内容',
    });
  }

  // 创建回复评论+回复回复接口
  async createReply(val, imageList) {
    const valuestr = val.replace(/\s/g, '');
    // 如果内部为空，且只包含空格或空行
    if (!valuestr && !imageList.length) {
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
        showCommentInput: false,
        inputText: '请输入内容',
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

  // 确定举报
  async onReportOk(val) {
    if (!val) return;

    const params = {
      threadId: this.props.comment.threadId,
      type: 2,
      reason: val,
      userId: this.props.user.userInfo.id,
      postId: this.props?.comment?.commentDetail?.id,
    };
    const { success, msg } = await this.props.thread.createReports(params);

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

  avatarClick(commentData) {
    const { userId } = commentData;
    if (!userId) return;
    this.props.router.push(`/user/${userId}`);
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
  onInputClick = () => {
    this.setState({ showCommentInput: true });
    this.replyClick(this.props.comment.commentDetail);
  }
  onEmojiIconClick = () => {
    this.setState({ showCommentInput: true });
    this.setState({ showEmojis: true });
    this.replyClick(this.props.comment.commentDetail);
  }
  onPcitureIconClick = () => {
    this.setState({ showCommentInput: true });
    this.setState({ showPicture: true });
    this.replyClick(this.props.comment.commentDetail);
  }


  onGotoThread = () => {
    const { threadId } = this.props.comment;
    this.props.router.push(`/thread/${threadId}`);
  }

  // 点击内容
  onCommentClick = (data) => {
    this.operationData = data || null;
    this.setState({ showOperationPopup: true });
  }

  // 点击内容操作框中的选项
  onOperationClick = (val) => {
    const { commentDetail } = this.props.comment;
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }
    // 回复
    if (val === 'reply') {
      if (this.operationData) {
        this.replyReplyClick(this.operationData, commentDetail);
      } else {
        this.replyClick(commentDetail);
      }
    }
    // 复制
    if (val === 'copy') {
      if (this.operationData) {
        this.onCopyClick(this.operationData);
      } else {
        this.onCopyClick(commentDetail);
      }
    }
    // 举报
    if (val === 'report') {
      this.setState({ showReportPopup: true });
    }
    this.setState({ showOperationPopup: false });
  }

  // 点击复制
  onCopyClick = (data) => {
    const { content } = data || {};
    this.copy(content);
    Toast.success({ content: '复制成功' });
  }

  // 复制方法
  copy = (content) => {
    const oInput = document.createElement('input');
    oInput.value = content;
    document.body.appendChild(oInput);
    oInput.select();
    oInput.readOnly = true;
    oInput.id = 'copyInp';
    document.execCommand('Copy');
    oInput.setAttribute('onfocus', undefined);
    oInput.blur();
    oInput.className = 'oInput';
    oInput.style.display = 'none';
  }

  handleShareClick = ()=>{
    const { user } = this.props;
    if (!user.isLogin()) {
      goToLoginPage({ url: '/user/login' });
      return;
    }
    this.setState({ shareShow: true });
  }
  onShareClose = () => {
    this.setState({ shareShow: false });
  };

  handleH5Share = async () => {
    Toast.info({ content: '复制链接成功' });

    this.onShareClose();

    const { title = '' } = this.props.thread?.threadData || {};
    h5Share({ title, path: `thread/comment/${this.props.comment?.commentDetail?.id}?threadId=${this.props.thread?.threadData?.threadId}&fromMessage=true` });
    const id = this.props.thread?.threadData?.id;

    const { success, msg } = await this.props.thread.shareThread(id, this.props.index, this.props.search, this.props.topic);

    if (!success) {
      Toast.error({
        content: msg,
      });
    }
  };
  handleWxShare = () => {
    this.setState({ isShowWeiXinShare: true });
    this.onShareClose();
    this.onShareClick();
  };
  // 分享
  async onShareClick() {
    // 判断是否在微信浏览器
    if (!isWeiXin()) return;

    this.setState({ isShowWeiXinShare: true });
    const data = this.props.thread.threadData;
    const threadId = data.id;
    const { success, msg } = await this.props.thread.shareThread(threadId, this.props.index, this.props.search, this.props.topic);
    if (!success) {
      Toast.error({
        content: msg,
      });
    }
  }


  createCard = async () => {
    const data = this.props.thread.threadData;
    const threadId = data.id;
    const { card } = this.props;
    const commentId = this.props.comment?.commentDetail?.id
    const { success, msg } = await this.props.thread.shareThread(threadId, this.props.index, this.props.search, this.props.topic);
    if (!success) {
      Toast.error({
        content: msg,
      });
    }

    card.setThreadData(data);
    Router.push({ url: `/card?commentId=${commentId}&threadId=${threadId}` });
  };

  render() {
    const { commentDetail: commentData, isReady } = this.props.comment;
    const { isAnonymous } = this.props.thread?.threadData || '';
    const { query } = this.props.router;
    // 更多弹窗权限
    const morePermissions = {
      // canEdit: commentData?.canEdit,
      canEdit: false,
      canDelete: commentData?.canDelete,
      canEssence: false,
      canStick: false,
      isAdmini: this.props?.user?.isAdmini,
    };

    // 更多弹窗界面
    const moreStatuses = {
      isEssence: false,
      isStick: false,
    };

    return (
      <div className={styles.index}>
        <Header></Header>
        {/* <div className={styles.header}>
          <div className={styles.show}>
            {
              this.state.isShowReward
                ? <div className={styles.showGet}>
                  <div className={styles.icon}>悬赏图标</div>
                  <div className={styles.showMoneyNum}>
                    获得<span className={styles.moneyNumber}>5.20</span>元悬赏金
                    </div>
                </div> : ''
            }
            {
              this.state.isShowRedPacket
                ? <div className={styles.showGet}>
                  <div className={styles.icon}>红包图标</div>
                  <div className={styles.showMoneyNum}>
                    获得<span className={styles.moneyNumber}>5.20</span>元红包
                    </div>
                </div> : ''
            }
          </div>
        </div> */}

        {/* 内容 */}
        <div className={styles.content}>
          {isReady && (
            <CommentList
              data={commentData}
              likeClick={() => this.likeClick(commentData)}
              replyClick={() => this.replyClick(commentData)}
              avatarClick={() => this.avatarClick(commentData)}
              deleteClick={() => this.deleteClick(commentData)}
              replyLikeClick={reply => this.replyLikeClick(reply, commentData)}
              replyReplyClick={reply => this.replyReplyClick(reply, commentData)}
              replyAvatarClick={(reply, floor) => this.replyAvatarClick(reply, commentData, floor)}
              replyDeleteClick={reply => this.replyDeleteClick(reply, commentData)}
              onCommentClick={reply => this.onCommentClick(reply)}
              onMoreClick={() => this.onMoreClick()}
              isHideEdit={true}
              threadId={this.props.thread?.threadData?.userId}
              postId={this.props.comment.postId}
              positionRef={this.positionRef}
              isAnonymous={isAnonymous}
              originThread={query.fromMessage ? <div className={styles.originThread} onClick={this.onGotoThread}>查看原帖</div> : false}
            ></CommentList>
          )}
        </div>
        <MorePopop
          show={this.state.shareShow}
          onClose={this.onShareClose}
          handleH5Share={this.handleH5Share}
          handleWxShare={this.handleWxShare}
          createCard={this.createCard}
        ></MorePopop>
        {isReady && (
          <div className={styles.inputFooterContainer}>
            <div className={styles.inputFooter}>
              {/* 评论区触发 */}
              <div className={footer.inputClick} onClick={() => this.onInputClick()}>
                <Input className={footer.input} placeholder="写评论" disabled={true} prefixIcon="EditOutlined"></Input>
              </div>

              {/* 操作区 */}
              <div className={footer.operate}>
                <Icon
                  className={footer.icon}
                  onClick={this.onEmojiIconClick}
                  size="20"
                  name="SmilingFaceOutlined"
                ></Icon>
                <Icon
                  className={footer.icon}
                  onClick={this.onPcitureIconClick}
                  size="20"
                  name="PictureOutlinedBig"
                ></Icon>
                <Icon
                  onClick={immediateDebounce(() => this.handleShareClick(), 1000)}
                  className={footer.icon}
                  size="20"
                  name="ShareAltOutlined"
                ></Icon>
              </div>
            </div>
          </div>
        )}
        <div className={styles.footer}>
          {/* 评论弹层 */}
          <InputPopup
            showEmojis={this.state.showEmojis}
            cancleEmojie={() => {
              this.setState({ showEmojis: false });
            }}
            showPicture={this.state.showPicture}
            canclePicture={() => {
              this.setState({ showPicture: false });
            }}
            visible={this.state.showCommentInput}
            inputText={this.state.inputText}
            onClose={() => this.setState({ showCommentInput: false })}
            onSubmit={(value, imageList) => this.createReply(value, imageList)}
            site={this.props.site}
          ></InputPopup>

          {/* 更多弹层 */}
          <MorePopup
            permissions={morePermissions}
            statuses={moreStatuses}
            visible={this.state.showMorePopup}
            onClose={() => this.setState({ showMorePopup: false })}
            onSubmit={() => this.setState({ showMorePopup: false })}
            onOperClick={type => this.onOperClick(type)}
          />

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

          {/* 举报弹层 */}
          <ReportPopup
            reportContent={this.reportContent}
            inputText={this.inputText}
            visible={this.state.showReportPopup}
            onCancel={() => this.setState({ showReportPopup: false })}
            onOkClick={data => this.onReportOk(data)}
          ></ReportPopup>

          {/* 操作内容弹层 */}
          <OperationPopup
            visible={this.state.showOperationPopup}
            onCancel={() => this.setState({ showOperationPopup: false })}
            onOperationClick={val => this.onOperationClick(val)}
          ></OperationPopup>

          {/* 微信浏览器内分享弹窗 */}
          <SharePopup
            visible={this.state.isShowWeiXinShare}
            onClose={() => this.setState({ isShowWeiXinShare: false })}
            type="thread"
          />
        </div>
      </div>
    );
  }
}

export default withRouter(HOCTencentCaptcha(CommentH5Page));
