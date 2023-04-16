import React, { Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import Router from '@discuzqsdk/sdk/dist/router';

import AuthorInfo from './components/author-info/index';
import CommentInput from './components/comment-input/index';
import LoadingTips from '@components/thread-detail-pc/loading-tips';
import { Icon, Toast, Popup } from '@discuzqsdk/design';
import UserInfo from '@components/thread/user-info';
import RewardPopup from './components/reward-popup';
import BaseLayout from '@components/base-layout';

import layout from './layout.module.scss';

import ReportPopup from './components/report-popup';
import ShowTop from './components/show-top';
import IsApproved from './components/isApproved';
import DeletePopup from '@components/thread-detail-pc/delete-popup';

import h5Share from '@discuzqsdk/sdk/dist/common_modules/share/h5';
import Copyright from '@components/copyright';
import threadPay from '@common/pay-bussiness/thread-pay';
import Recommend from '@components/recommend';
import QcCode from '@components/qcCode';

import RenderThreadContent from './content';
import RenderCommentList from './comment-list';
import goToLoginPage from '@common/utils/go-to-login-page';
import classNames from 'classnames';

import HOCTencentCaptcha from '@middleware/HOCTencentCaptcha';

@inject('site')
@inject('user')
@inject('thread')
@inject('commentPosition')
@inject('comment')
@inject('index')
@observer
class ThreadPCPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showReportPopup: false, // 是否弹出举报弹框
      showDeletePopup: false, // 是否弹出删除弹框
      showCommentInput: false, // 是否弹出评论框
      showMorePopup: false, // 是否弹出更多框
      showRewardPopup: false, // 打赏弹窗
      isCommentLoading: false, // 列表loading
      setTop: false, // 置顶
      inputValue: '', // 评论内容,
      isBaseLayoutReady: false,
    };

    this.likedLoading = false;
    this.collectLoading = false;

    this.perPage = 20;
    this.page = 1; // 页码
    this.commentDataSort = true;

    // 滚动定位相关属性
    this.threadBodyRef = React.createRef();
    this.commentDataRef = React.createRef();

    this.position = 0;

    // 修改评论数据
    this.comment = null;

    // 举报内容选项
    this.reportContent = ['广告垃圾', '违规内容', '恶意灌水', '重复发帖'];
    this.inputText = '请输入其他理由';

    this.positionRef = React.createRef();
    this.isPositioned = false;
  }

  // 上拉刷新事件
  handleOnRefresh() {
    this.props.thread.setCommentListPage(this.props.thread.page + 1);
    return this.loadCommentList();
  }

  // 滚动事件
  handleOnScroll() {
    const threadBodyRef = this.threadBodyRef?.current?.listRef?.current?.listWrapper;

    if (threadBodyRef && threadBodyRef.current) {
      // 加载评论列表
      const scrollDistance = threadBodyRef?.current?.scrollTop;
      // const offsetHeight = threadBodyRef?.current?.offsetHeight;
      // const scrollHeight = threadBodyRef?.current?.scrollHeight;
      // const { isCommentReady, isNoMore } = this.props.thread;
      // 记录当前的滚动位置
      this.props.thread.setScrollDistance(scrollDistance);
      // if (
      //   scrollDistance + offsetHeight >= scrollHeight - 20 &&
      //   !this.state.isCommentLoading &&
      //   isCommentReady &&
      //   !isNoMore
      // ) {
      // this.page = this.page + 1;
      // this.loadCommentList();
      // }
    }
  }

  // baselayout componentDidMount 事件
  onBaseLayoutReady() {
    this.setState({
      isBaseLayoutReady: true,
    });
  }

  componentDidUpdate() {
    if (this.state.isBaseLayoutReady) {
      const threadBodyRef = this.threadBodyRef?.current?.listRef?.current?.listWrapper;
      threadBodyRef && this.scrollToPostion(threadBodyRef);
      this.setState({
        isBaseLayoutReady: false,
      });
    }

    // 滚动到指定的评论定位位置
    if (this.props.commentPosition?.postId && !this.isPositioned && this.positionRef?.current) {
      this.isPositioned = true;
      setTimeout(() => {
        this.positionRef.current.scrollIntoView();
      }, 1000);
    }
  }

  componentWillUnmount() {
    // 清空数据
    // this.props?.thread && this.props.thread.reset();
  }

  // 滚动到指定位置
  scrollToPostion(scrollBodyRef) {
    // 是否定位到评论位置
    // if (this.props?.thread?.isPositionToComment) {
    //   // 当内容加载完成后，获取评论区所在的位置
    //   this.position = this.commentDataRef?.current?.offsetTop - 50;
    //   // TODO:需要监听帖子内容加载完成事件
    //   setTimeout(() => {
    //     scrollBodyRef?.current?.scrollTo(0, this.position);
    //   }, 1000);
    //   return;
    // }


    // 滚动到记录的指定位置
    scrollBodyRef?.current?.scrollTo(0, this.props.thread.scrollDistance);
  }

  // 加载第二段评论列表
  async loadCommentList() {
    const { isCommentReady } = this.props.thread;
    if (this.state.isCommentLoading || !isCommentReady) {
      return;
    }

    this.setState({
      isCommentLoading: true,
    });
    const id = this.props.thread?.threadData?.id;
    const params = {
      id,
      page: this.props.thread.page,
      perPage: this.perPage,
      sort: this.commentDataSort ? 'createdAt' : '-createdAt',
    };

    const { success, msg } = await this.props.thread.loadCommentList(params);
    this.setState({
      isCommentLoading: false,
    });
    if (success) {
      return;
    }
    Toast.error({
      content: msg,
    });
  }

  // 列表排序
  onSortChange(isCreateAt) {
    this.commentDataSort = isCreateAt;
    this.props.thread.setCommentListPage(1);
    this.props.commentPosition.reset();
    this.loadCommentList();
  }

  // 点击评论
  onInputClick() {
    this.setState({
      showCommentInput: true,
    });
  }

  // 更多操作
  onOperClick(type) {
    // 举报
    if (type === 'stick') {
      this.updateStick();
    }

    // 加精
    if (type === 'essence') {
      this.updateEssence();
    }
	
	// 海报
	if (type === 'poster') {
	  this.updatePoster();
	}

    // 删除
    if (type === 'delete') {
      this.setState({ showDeletePopup: true });
    }

    // 编辑
    if (type === 'edit') {
      if (!this.props.thread?.threadData?.id) return;
      this.props.router.push(`/thread/post?id=${this.props.thread?.threadData?.id}`);
    }

    // 举报
    if (type === 'report') {
      this.setState({ showReportPopup: true });
    }
  }

  onReportClick(comment) {
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

  onReportCancel() {
    this.comment = null;
    this.setState({ showReportPopup: false });
  }

  // 置顶提示
  setTopState(isStick) {
    this.setState({
      showContent: isStick,
      setTop: !this.state.setTop,
    });
    setTimeout(() => {
      this.setState({ setTop: !this.state.setTop });
    }, 2000);
  }

  // 置顶接口
  async updateStick() {
    const id = this.props.thread?.threadData?.id;
    const params = {
      id,
      isStick: !this.props.thread?.threadData?.isStick,
    };
    const { success, msg } = await this.props.thread.updateStick(params);

    if (success) {
      this.setTopState(params.isStick);
      // 更新首页置顶列表
      this.props?.index?.refreshHomeData && this.props.index.refreshHomeData();

      return;
    }

    Toast.error({
      content: msg,
    });
  }

  // 加精接口
  async updateEssence() {
    const id = this.props.thread?.threadData?.id;
    const params = {
      id,
      isEssence: !this.props.thread?.threadData?.displayTag?.isEssence,
    };
    const { success, msg } = await this.props.thread.updateEssence(params);

    // 更新列表store数据
    this.props.thread.updateListStore();

    if (success) {
      Toast.success({
        content: '操作成功',
      });
      return;
    }

    Toast.error({
      content: msg,
    });
  }
  
  // 海报接口
  async updatePoster() {
    const id = this.props.thread?.threadData?.id;
    const params = {
      id,
      isPoster: !this.props.thread?.threadData?.displayTag?.isPoster,
    };
    const { success, msg } = await this.props.thread.updatePoster(params);
  
    // 更新列表store数据
    this.props.thread.updateListStore();
  
    if (success) {
      Toast.success({
        content: '操作成功',
      });
      return;
    }
  
    Toast.error({
      content: msg,
    });
  }

  // 帖子删除接口
  async delete() {
    this.setState({ showDeletePopup: false });
    const id = this.props.thread?.threadData?.id;

    const { success, msg } = await this.props.thread.delete(id);

    if (success) {
      Toast.success({
        content: '删除成功，即将跳转至首页',
      });
      this.props.index.deleteThreadsData({ id }, this.props.site);
      setTimeout(() => {
        this.props.router.push('/');
      }, 1000);

      return;
    }

    Toast.error({
      content: msg,
    });
  }

  onBtnClick() {
    this.delete();
    this.setState({ showDeletePopup: false });
  }

  // 点击发布按钮
  async onPublishClick(val = '', imageList = []) {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    const valuestr = val.replace(/\s/g, '');
    // 如果内部为空，且只包含空格或空行
    if (!valuestr && imageList.length === 0) {
      Toast.info({ content: '请输入内容' });
      return;
    }

    const params = {
      val,
      imageList,
    }

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

    return this.comment ? await this.updateComment(params) : await this.createComment(params);
  }

  // 创建评论
  async createComment({val, imageList, captchaTicket = '', captchaRandStr = ''}) {
    const id = this.props.thread?.threadData?.id;

    const params = {
      id,
      content: val,
      // postId: this.props.thread?.threadData?.postId,
      sort: this.commentDataSort, // 目前的排序
      isNoMore: this.props?.thread?.isNoMore,
      attachments: [],
      captchaTicket,
      captchaRandStr,
    };

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

    const { success, msg, isApproved, redPacketAmount } = await this.props.comment.createComment(params, this.props.thread);
    if (success) {
      if (isApproved) {
        Toast.success({
          content: msg,
        });
      } else {
        Toast.warning({
          content: msg,
        });
      }

      if (redPacketAmount && redPacketAmount > 0) {
        this.props.thread.setRedPacket(redPacketAmount);
      }

      // 更新帖子中的评论数据
      this.props.thread.updatePostCount(this.props.thread.totalCount);
      // 更新列表store数据
      this.props.thread.updateListStore();

      // 是否红包帖
      const isRedPack = this.props.thread?.threadData?.displayTag?.isRedPack;
      // TODO:可以进一步细化判断条件，是否还有红包
      if (isRedPack) {
        // 评论获得红包帖，更新帖子数据
        this.props.thread.fetchThreadDetail(id);
      }

      this.setState({
        showCommentInput: false,
        inputValue: '',
      });
      return true;
    }
    Toast.error({
      content: msg,
    });
  }

  // 更新评论
  async updateComment({val, imageList, captchaTicket = '', captchaRandStr = ''}) {
    if (!this.comment) return;

    const id = this.props.thread?.threadData?.id;
    const params = {
      id,
      postId: this.comment.id,
      content: val,
      attachments: [],
      captchaTicket,
      captchaRandStr,
    };

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

    const { success, msg, isApproved } = await this.props.comment.updateComment(params, this.props.thread);
    if (success) {
      if (isApproved) {
        Toast.success({
          content: msg,
        });
      } else {
        Toast.warning({
          content: msg,
        });
      }
      this.setState({
        showCommentInput: false,
      });
      return true;
    }
    Toast.error({
      content: msg,
    });
  }

  // 点击编辑评论
  onEditClick(comment) {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    this.comment = comment;
    this.setState({
      inputValue: comment.content,
      showCommentInput: true,
    });
  }

  // 弹出框关闭
  onClose() {
    this.setState({
      showCommentInput: false,
    });
    this.comment = null;
  }

  // 点赞
  async onLikeClick() {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    if (this.likedLoading) return;

    this.likedLoading = true;

    const id = this.props.thread?.threadData?.id;
    const params = {
      id,
      pid: this.props.thread?.threadData?.postId,
      isLiked: !this.props.thread?.threadData?.isLike,
    };
    const { success, msg } = await this.props.thread.updateLiked(
      params,
      this.props.index,
      this.props.user,
    );

    this.likedLoading = false;

    if (!success) {
      Toast.error({
        content: msg,
      });
    }
  }

  // 分享
  async onShareClick() {
    Toast.info({ content: '复制链接成功' });

    const { title = '' } = this.props.thread?.threadData || {};
    h5Share({ title, path: `thread/${this.props.thread?.threadData?.threadId}` });

    const id = this.props.thread?.threadData?.id;

    const { success, msg } = await this.props.thread.shareThread(id);

    if (!success) {
      Toast.error({
        content: msg,
      });
    }
  }

  // 点击收藏icon
  async onCollectionClick() {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    if (this.collectLoading) return;

    this.collectLoading = true;

    const id = this.props.thread?.threadData?.id;
    const params = {
      id,
      isFavorite: !this.props.thread?.isFavorite,
    };
    const { success, msg } = await this.props.thread.updateFavorite(params);

    this.collectLoading = false;

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

    if (this.props.thread.threadData.userId) {
      this.props.thread?.authorInfo?.follow === 2 || this.props.thread?.authorInfo?.follow === 1
        ? this.props.thread.cancelFollow({ id: this.props.thread.threadData.userId, type: 1 }, this.props.user)
        : this.props.thread.postFollow(this.props.thread.threadData.userId, this.props.user);
    }
  }

  // 付费支付
  async onPayClick() {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    const thread = this.props.thread.threadData;
    const { success } = await threadPay(thread, this.props.user?.userInfo);

    // 支付成功重新请求帖子数据
    if (success && this.props.thread?.threadData?.threadId) {
      await this.props.thread.fetchThreadDetail(this.props.thread?.threadData?.threadId);
      // 更新首页store数据
      this.props.thread.updateListStore();
    }
  }

  // 点击打赏
  onRewardClick() {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    this.setState({ showRewardPopup: true });
  }

  // 确认打赏
  async onRewardSubmit(value) {
    if (!isNaN(Number(value)) && this.props.thread?.threadData?.threadId && this.props.thread?.threadData?.userId) {
      this.setState({ showRewardPopup: false });
      const params = {
        amount: Number(value),
        threadId: this.props.thread.threadData.threadId,
        payeeId: this.props.thread.threadData.userId,
        title: this.props.thread?.threadData?.title || '主题打赏',
      };

      const { success, msg } = await this.props.thread.rewardPay(
        params,
        this.props.user,
        this.props.index,
      );

      if (!success) {
        Toast.error({
          content: msg,
        });
      }
    }
  }

  // 点击标签 TODO:带上参数
  onTagClick() {
    // TODO:目前后台只返回了一个子标签，未返回父标签
    const categoryId = this.props.thread?.threadData?.categoryId;
    if (categoryId || typeof categoryId === 'number') {
      this.props.index.refreshHomeData({ categoryIds: [categoryId] });
    }
    this.props.router.push(`/cate/${categoryId}/seq/0`);
  }

  // 点击发送私信
  onPrivateLetter() {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    const { id:userId, nickname } = this.props.thread?.authorInfo;
    if (!userId) return;
    Router.push({ url: `/message?page=chat&userId=${userId}&nickname=${nickname}` });
  }

  onUserClick(userId) {
    if (!userId) return;
    Router.push({ url: `/user/${userId}` });
  }

  // 点击加载更多
  onLoadMoreClick() {
    this.props.commentPosition.page = this.props.commentPosition.page + 1;
    this.loadCommentPositionList();
  }

  // 加载第一段评论列表
  async loadCommentPositionList() {
    const { isCommentReady } = this.props.commentPosition;
    if (this.state.isCommentLoading || !isCommentReady) {
      return;
    }

    this.setState({
      isCommentLoading: true,
    });
    const id = this.props.thread?.threadData?.id;
    const params = {
      id,
      page: this.props?.commentPosition?.page || 1,
      perPage: this.perPage,
      sort: this.commentDataSort ? 'createdAt' : '-createdAt',
    };

    const { success, msg } = await this.props.commentPosition.loadCommentList(params);
    this.setState({
      isCommentLoading: false,
    });
    if (success) {
      return true;
    }
    Toast.error({
      content: msg,
    });
  }

  renderContent() {
    const { thread: threadStore, canPublish } = this.props;

    const { isReady, isCommentReady, isNoMore, totalCount, isCommentListError } = threadStore;

	const { webConfig } = this.props.site;
    // 是否审核通过
    const isApproved = (threadStore?.threadData?.isApproved || 0) === 1;

    // // 定位评论相关
    const { isShowCommentList, isNoMore: isCommentPositionNoMore } = this.props.commentPosition;

    return (
      <div className={layout.bodyLeft}>
        {isReady && !isApproved && <div className={layout.examinePosition}></div>}
        {/* 帖子内容 */}
        {isReady ? (
          <RenderThreadContent
            store={threadStore}
            onOperClick={type => this.onOperClick(type)}
            onLikeClick={() => this.onLikeClick()}
            onCollectionClick={() => this.onCollectionClick()}
            onShareClick={() => this.onShareClick()}
            onRewardClick={() => this.onRewardClick()}
            onTagClick={() => this.onTagClick()}
            onPayClick={() => this.onPayClick()}
            onUserClick={() => this.onUserClick(this.props.thread?.threadData?.user?.userId)}
          />
        ) : (
          <LoadingTips type="init"></LoadingTips>
        )}

        {/*/!* 回复详情内容 *!/*/}
		{/*{webConfig.setSite.siteComment[0].value && (*/}
		{/*  <div className={`${layout.bottom}`}>*/}
		{/*    {isCommentReady && isApproved ? (*/}
		{/*      <Fragment>*/}
		{/*        /!* 第一段列表 *!/*/}
		{/*        {isCommentReady && isShowCommentList && (*/}
		{/*          <Fragment>*/}
		{/*            <RenderCommentList*/}
		{/*              commentDataRef={this.commentDataRef}*/}
		{/*              isPositionComment={true}*/}
		{/*              router={this.props.router}*/}
		{/*              sort={flag => this.onSortChange(flag)}*/}
		{/*              replyAvatarClick={(comment, reply, floor) => this.replyAvatarClick(comment, reply, floor)}*/}
		{/*            ></RenderCommentList>*/}
		{/*            {!isCommentPositionNoMore && (*/}
		{/*            // <BottomView*/}
		{/*            //   onClick={() => this.onLoadMoreClick()}*/}
		{/*            //   noMoreType="line"*/}
		{/*            //   loadingText="点击加载更多"*/}
		{/*            //   isError={isCommentListError}*/}
		{/*            //   noMore={isCommentPositionNoMore}*/}
		{/*            // ></BottomView>*/}
		{/*  */}
		{/*              <div className={layout.showMore} onClick={() => this.onLoadMoreClick()}>*/}
		{/*                <div className={layout.hidePercent}>展开更多评论</div>*/}
		{/*                <Icon className={layout.icon} name="RightOutlined" size={12} />*/}
		{/*              </div>*/}
		{/*            )}*/}
		{/*          </Fragment>*/}
		{/*        )}*/}
		{/*  */}
		{/*        <RenderCommentList*/}
		{/*          canPublish={canPublish}*/}
		{/*          positionRef={this.positionRef}*/}
		{/*          showHeader={!isShowCommentList}*/}
		{/*          router={this.props.router}*/}
		{/*          sort={flag => this.onSortChange(flag)}*/}
		{/*          onEditClick={comment => this.onEditClick(comment)}*/}
		{/*          onPublishClick={(value, imageList) => this.onPublishClick(value, imageList)}*/}
		{/*          onReportClick={comment => this.onReportClick(comment)}*/}
		{/*        ></RenderCommentList>*/}
		{/*        /!* {this.state.isCommentLoading && <LoadingTips></LoadingTips>} *!/*/}
		{/*      </Fragment>*/}
		{/*    ) : (*/}
		{/*      isApproved && <LoadingTips isError={isCommentListError} type="init"></LoadingTips>*/}
		{/*    )}*/}
		{/*  </div>*/}
		{/*)}*/}
        
        {/* {isNoMore && <NoMore empty={totalCount === 0}></NoMore>} */}
      </div>
    );
  }

  renderRight() {
    const { thread: threadStore } = this.props;
    const { isAuthorInfoError, isReady } = threadStore;

    // 是否审核通过
    const isApproved = (threadStore?.threadData?.isApproved || 0) === 1;
    // 是否作者自己
    const isSelf = this.props.user?.userInfo?.id && this.props.user?.userInfo?.id === threadStore?.threadData?.userId;
    // 是否匿名
    const isAnonymous = threadStore?.threadData?.isAnonymous;
    return (
      <div className={`${layout.bodyRigth}`}>
        {isReady && !isApproved && <div className={layout.examinePosition}></div>}
        {!isAnonymous && (
          <div className={`${layout.authorInfo} detail-authorinfo`}>
            {threadStore?.authorInfo ? (
              <AuthorInfo
                user={threadStore.authorInfo}
                onFollowClick={() => this.onFollowClick()}
                onPrivateLetter={() => this.onPrivateLetter()}
                onPersonalPage={() => this.onUserClick(this.props.thread?.threadData?.user?.userId)}
                isShowBtn={!isSelf}
              ></AuthorInfo>
            ) : (
              <LoadingTips type="init" isError={isAuthorInfoError}></LoadingTips>
            )}
          </div>
        )}
        <div className={layout.recommend}>
          <Recommend></Recommend>
        </div>
        <div className={layout.qrcode}>
          <QcCode></QcCode>
        </div>
        <Copyright className={layout.copyright}></Copyright>
      </div>
    );
  }

  render() {
    const { isCommentReady, isNoMore } = this.props.thread;
    const { thread: threadStore } = this.props;
    const { isReady } = threadStore;

    // 是否审核通过
    const isApproved = (threadStore?.threadData?.isApproved || 0) === 1;
    // TODO:目前还不清楚这块代码的作用，可能会对过滤代码块有影响
    // console.log(threadStore?.threadData)
    // if ( threadStore?.threadData ) {
    //   const text = threadStore?.threadData.content.text;
    //   let reg=/(<\/?.+?\/?>)|\n/g;
    //   let newText = text.replace(reg,'');
    //   // newText = newText.replace(/\n/g, '');
    //   console.log(newText);
    // }
    // 是否匿名
    const isAnonymous = threadStore?.threadData?.isAnonymous;
    // 是否作者本人
    const isSelf = this.props.user?.userInfo?.id && this.props.user?.userInfo?.id === threadStore?.threadData?.userId;
    return (
      <div>
        <ShowTop showContent={this.props.thread?.threadData?.isStick} setTop={this.state.setTop}></ShowTop>
        <IsApproved isShow={isReady && !isApproved}></IsApproved>

        <BaseLayout
          onRefresh={() => this.handleOnRefresh()}
          onScroll={() => this.handleOnScroll()}
          noMore={isNoMore}
          ref={this.threadBodyRef}
          showRefresh={false}
          right={this.renderRight()}
          isShowLayoutRefresh={isCommentReady}
          ready={() => this.onBaseLayoutReady()}
          rightClassName={classNames(layout.positionSticky, {
            'is-userinfo-show': !isAnonymous,
            'is-operate-show': !isSelf,
          })}
          className="detail"
        >
          {this.renderContent()}
        </BaseLayout>

        {/* 编辑弹窗 */}
        <Popup position="center" visible={this.state.showCommentInput} onClose={() => this.onClose()}>
          <div className={layout.editCmment}>
            <div className={layout.close} onClick={() => this.onClose()}>
              <Icon size={18} name="WrongOutlined"></Icon>
            </div>
            <div className={layout.title}>编辑评论</div>
            <div className={layout.user}>
              <UserInfo
                name={this?.comment?.user?.nickname || ''}
                avatar={this?.comment?.user?.avatar || ''}
                time={`${this?.comment?.updatedAt}` || ''}
                userId={this?.comment?.user?.userId}
                platform="pc"
              ></UserInfo>
            </div>
            <CommentInput
              height="middle"
              onSubmit={value => this.onPublishClick(value)}
              initValue={this.state.inputValue}
              threadId={this.props.thread?.threadData?.userId}
              isAnonymous = {isAnonymous}
            ></CommentInput>
          </div>
        </Popup>

        {/* 删除弹层 */}
        <DeletePopup
          visible={this.state.showDeletePopup}
          onClose={() => this.setState({ showDeletePopup: false })}
          onBtnClick={() => this.delete()}
          type="thread"
        ></DeletePopup>

        {/* 举报弹层 */}
        <ReportPopup
          reportContent={this.reportContent}
          inputText={this.inputText}
          visible={this.state.showReportPopup}
          onCancel={() => this.onReportCancel()}
          onOkClick={data => this.onReportOk(data)}
        ></ReportPopup>

        {/* 打赏弹窗 */}
        <RewardPopup
          visible={this.state.showRewardPopup}
          onCancel={() => this.setState({ showRewardPopup: false })}
          onOkClick={value => this.onRewardSubmit(value)}
        ></RewardPopup>
      </div>
    );
  }
}

export default withRouter(HOCTencentCaptcha(ThreadPCPage));
