import React, { Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import Router from '@discuzqsdk/sdk/dist/router';

import layout from './layout.module.scss';
import footer from './footer.module.scss';

import NoMore from './components/no-more';
import LoadingTips from '@components/thread-detail-pc/loading-tips';

// import styleVar from '@common/styles/theme/default.scss.json';
import { Icon, Input, Toast } from '@discuzqsdk/design';
import Header from '@components/header';
import goToLoginPage from '@common/utils/go-to-login-page';

import ReportPopup from './components/report-popup';
import ShowTop from './components/show-top';
import DeletePopup from '@components/thread-detail-pc/delete-popup';
import MorePopup from './components/more-popup';
import InputPopup from './components/input-popup';
import throttle from '@common/utils/thottle';
import { debounce } from '@common/utils/throttle-debounce';
import { debounce as immediateDebounce } from '@components/thread/utils';
import h5Share from '@discuzqsdk/sdk/dist/common_modules/share/h5';
import threadPay from '@common/pay-bussiness/thread-pay';
import RewardPopup from './components/reward-popup';
import SharePopup from '@components/thread/share-popup';
import isWeiXin from '@common/utils/is-weixin';

import RenderThreadContent from './content';
import RenderCommentList from './comment-list';
import classNames from 'classnames';

import BottomView from '@components/list/BottomView';
import Copyright from '@components/copyright';

import MorePopop from '@components/more-popop';

import HOCTencentCaptcha from '@middleware/HOCTencentCaptcha';

import { parseContentData } from '../utils';
const hongbaoMini = 'https://cloudcache.tencentcs.com/operation/dianshi/other/redpacket-mini.10b46eefd630a5d5d322d6bbc07690ac4536ee2d.png';

@inject('site')
@inject('user')
@inject('thread')
@inject('commentPosition')
@inject('comment')
@inject('index')
@inject('card')
@inject('vlist')
@observer
class ThreadH5Page extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loadWeiXin: false,
      isShowWeiXinShare: false, // 是否弹出微信浏览器分享弹框
      showReportPopup: false, // 是否弹出举报弹框
      showDeletePopup: false, // 是否弹出删除弹框
      showCommentInput: false, // 是否弹出评论框
      showMorePopup: false, // 是否弹出更多框
      showRewardPopup: false, // 打赏弹窗
      isCommentLoading: false, // 列表loading
      setTop: false, // 置顶
      showContent: '',
      // inputValue: '', // 评论内容
      show: false, // 分享海报弹窗
      stateFlag: !this.props.thread?.isPositionToComment,
      contentImgIsReady: false, // 内容区域图片是否加载完成
    };

    this.perPage = 20;
    this.commentDataSort = true;

    // 滚动定位相关属性
    this.threadBodyRef = React.createRef();
    this.commentDataRef = React.createRef();
    this.position = 0;
    this.nextPosition = 0;
    this.flag = !this.props.thread?.isPositionToComment;
    this.isFirst = true;
    // 修改评论数据
    this.comment = null;

    // 举报内容选项
    this.reportContent = ['广告垃圾', '违规内容', '恶意灌水', '重复发帖'];
    this.inputText = '其他理由...';

    this.positionRef = React.createRef();
    this.isPositioned = false;
  }

  // 滚动事件
  handleOnScroll() {
    // 加载评论列表
    const scrollDistance = this.threadBodyRef?.current?.scrollTop;
    const offsetHeight = this.threadBodyRef?.current?.offsetHeight;
    const scrollHeight = this.threadBodyRef?.current?.scrollHeight;
    const { isCommentReady, isNoMore } = this.props.thread;
    // 记录当前的滚动位置
    this.props.thread.setScrollDistance(scrollDistance);
    if (scrollDistance + offsetHeight >= scrollHeight && !this.state.isCommentLoading && isCommentReady && !isNoMore) {
      this.props.thread.setCommentListPage(this.props.thread.page + 1);
      this.loadCommentList();
    }

    if (this.flag) {
      this.nextPosition = this.threadBodyRef?.current?.scrollTop || 0;
    }
  }

  componentDidMount() {
    this.setState({ loadWeiXin: isWeiXin() });
  }
  componentDidUpdate() {
    if (!this.isFirst) {
      return;
    }
    const { thread } = this.props;
    // 当图片都加载完成后
    if (this.state.contentImgIsReady) {
      this.isFirst = false;
      // 当内容加载完成后，获取评论区所在的位置
      this.position = this.commentDataRef?.current?.offsetTop - 50;
      thread.clearContentImgState();
      // 是否定位到评论位置
      if (this.props?.thread?.isPositionToComment) {
        // TODO:需要监听帖子内容加载完成事件
        setTimeout(() => {
          this.threadBodyRef?.current?.scrollTo(0, this.position);
        }, 1000);
        return;
      }
      // 滚动到记录的指定位置
      this.threadBodyRef.current.scrollTo(0, this.props.thread.scrollDistance);
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
  setContentImgReady = () => {
    this.setState({ contentImgIsReady: true });
  };
  // 点击信息icon
  onMessageClick() {
    const position = this.flag ? this.position : 0;
    this.flag = !this.flag;
    this.setState({ stateFlag: this.flag });
    this.threadBodyRef.current.scrollTo(0, position);
  }

  // 点击收藏icon
  async onCollectionClick() {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    const id = this.props.thread?.threadData?.id;
    const params = {
      id,
      isFavorite: !this.props.thread?.isFavorite,
    };
    const { success, msg } = await this.props.thread.updateFavorite(params);

    if (success) {
      Toast.success({
        content: params.isFavorite ? '收藏成功' : '取消收藏',
      });
      return;
    }

    Toast.error({
      content: msg,
    });
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
      return true;
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
    return this.loadCommentList();
  }

  // 点击评论
  onInputClick() {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }
    if (!this.props.canPublish('reply')) return;
    this.setState({
      showCommentInput: true,
    });
  }

  // onUserClick(userId) {
  //   if (!userId) return;
  //   Router.push({ url: `/user/${userId}` });
  // }

  // 点击更多icon
  onMoreClick = () => {
    // this.setState({
    //   text: !this.state.text,
    // });
    this.setState({ showMorePopup: true });
  };

  onOperClick = (type) => {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    this.setState({ showMorePopup: false });

    // 举报
    if (type === 'stick') {
      this.updateStick();
    }

    // 加精
    if (type === 'essence') {
      this.updateEssence();
    }

    // 删除
    if (type === 'delete') {
      this.setState({ showDeletePopup: true });
    }

    // 编辑
    if (type === 'edit') {
      if (!this.props.thread?.threadData?.id) return;
      Router.push({ url: `/thread/post?id=${this.props.thread?.threadData?.id}` });
    }

    // 举报
    if (type === 'report') {
      this.setState({ showReportPopup: true });
    }

    // 收藏
    if (type === 'collect') {
      this.onCollectionClick();
    }

    // 微信分享
    if (type === 'wxshare') {
      this.onShareClick();
    }

    // 复制链接
    if (type === 'copylink') {
      this.handleH5Share();
    }

    // 海报
    if (type === 'post') {
      this.createCard();
    }
  };

  // 确定举报
  async onReportOk(val) {
    if (!val) return;

    const params = {
      threadId: this.props.thread.threadData.threadId,
      type: 1,
      reason: val,
      userId: this.props.user.userInfo.id,
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
        Router.push({ url: '/' });
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

    // 验证码
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

      if (redPacketAmount && redPacketAmount > 0) {
        this.props.thread.setRedPacket(redPacketAmount);
      }

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

  // 更新评论
  async updateComment({val, captchaTicket = '', captchaRandStr = ''}) {
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

    if (!success) {
      Toast.error({
        content: msg,
      });
    }
  }

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
  handleClick = () => {
    const { user } = this.props;
    if (!user.isLogin()) {
      goToLoginPage({ url: '/user/login' });
      return;
    }
    this.setState({ show: true });
  };
  onShareClose = () => {
    this.setState({ show: false });
  };
  handleH5Share = async () => {
    Toast.info({ content: '复制链接成功' });

    this.onShareClose();

    const { title = '' } = this.props.thread?.threadData || {};
    h5Share({ title, path: `thread/${this.props.thread?.threadData?.threadId}` });

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
  createCard = async () => {
    const data = this.props.thread.threadData;
    const threadId = data.id;
    const { card } = this.props;

    const { success, msg } = await this.props.thread.shareThread(threadId, this.props.index, this.props.search, this.props.topic);
    if (!success) {
      Toast.error({
        content: msg,
      });
    }

    card.setThreadData(data);
    Router.push({ url: `/card?threadId=${threadId}` });
  };
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
      // 更新列表store数据
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
    this.props.vlist.resetPosition();
    Router.push({ url: `/cate/${categoryId}/seq/0` });
  }

  replyAvatarClick(reply, comment, floor) {
    if (floor === 2) {
      const { userId } = reply;
      if (!userId) return;
      Router.push({ url: `/user/${userId}` });
    }
    if (floor === 3) {
      const { commentUserId } = reply;
      if (!commentUserId) return;
      Router.push({ url: `/user/${commentUserId}` });
    }
  }

  onUserClick(e) {
    const { threadData } = this.props.thread || {};
    const useId = threadData?.user?.userId;
    if (!useId) return;
    Router.push({ url: `/user/${threadData?.user?.userId}` });
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


  render() {
    const { thread: threadStore } = this.props;
    const { isReady, isCommentReady, isNoMore, totalCount, isCommentListError } = threadStore;
    const { indexes } = threadStore?.threadData?.content || {};
    const { RED_PACKET } = parseContentData(indexes);
    const hasHongbao = RED_PACKET?.condition === 0 && RED_PACKET?.remainNumber > 0; // 是否s是回复红包且还有剩余未领完红包

    const fun = {
      moreClick: this.onMoreClick,
    };


    // const isDraft = threadStore?.threadData?.isDraft;
    // // 是否红包帖
    // const isRedPack = threadStore?.threadData?.displayTag?.isRedPack;
    // // 是否悬赏帖
    // const isReward = threadStore?.threadData?.displayTag?.isReward;

    // 更多弹窗权限
    const morePermissions = {
      // （不是草稿 && 有编辑权限 && 不是红包帖 && 不是悬赏帖） || （是草稿 && 有编辑权限）
      // canEdit:
      //   (!isDraft && threadStore?.threadData?.ability?.canEdit && !isRedPack && !isReward)
      //   || (isDraft && threadStore?.threadData?.ability?.canEdit),
      canEdit: threadStore?.threadData?.ability?.canEdit, // 更新：帖子都可以编辑，根据编辑的权限来处理即可
      canDelete: threadStore?.threadData?.ability?.canDelete,
      canEssence: threadStore?.threadData?.ability?.canEssence,
      canStick: threadStore?.threadData?.ability?.canStick,
      canShare: this.props.user.isLogin(),
      canWxShare: this.props.user.isLogin() && isWeiXin(),
      canCollect: this.props.user.isLogin(),
      isAdmini: this.props?.user?.isAdmini,
    };
    // 更多弹窗界面
    const moreStatuses = {
      isEssence: threadStore?.threadData?.displayTag?.isEssence,
      isStick: threadStore?.threadData?.isStick,
      isCollect: threadStore?.isFavorite,
    };

    // 是否审核通过
    const isApproved = (threadStore?.threadData?.isApproved || 0) === 1;

    // 定位评论相关
    const { isShowCommentList, isNoMore: isCommentPositionNoMore } = this.props.commentPosition;
	const { webConfig } = this.props.site;

    return (
      <div className={layout.container}>
        <div className={layout.header}>
          <Header></Header>
          {isReady && !isApproved && (
            <div className={layout.examine}>
              <Icon className={layout.tipsIcon} name="TipsOutlined"></Icon>
              <span className={layout.tipsText}>内容正在审核中，审核通过后才能正常显示！</span>
            </div>
          )}
        </div>
        <div
          className={layout.body}
          ref={this.threadBodyRef}
          // onScrollCapture={() => throttle(this.handleOnScroll, 3000)}
          onScrollCapture={throttle(() => this.handleOnScroll(), 1000)}
        >
          <ShowTop showContent={this.state.showContent} setTop={this.state.setTop}></ShowTop>
          {/* 帖子内容 */}
          {isReady ? (
            <RenderThreadContent
              store={threadStore}
              setContentImgReady={this.setContentImgReady}
              fun={fun}
              onLikeClick={() => this.onLikeClick()}
              onOperClick={type => this.onOperClick(type)}
              onCollectionClick={() => this.onCollectionClick()}
              onReportClick={() => this.onReportClick()}
              onRewardClick={() => this.onRewardClick()}
              onTagClick={() => this.onTagClick()}
              onPayClick={() => this.onPayClick()}
              // onPayClick={() => this.onPayClick()}
              onUserClick={e => this.onUserClick(e)}
            ></RenderThreadContent>
          ) : (
            <LoadingTips type="init"></LoadingTips>
          )}

          {/* 评论列表 */}
		  {webConfig.setSite.siteComment[1].value && (
			<>
				  {isReady && isApproved && (
					<div className={`${layout.bottom}`} ref={this.commentDataRef}>
					  {isCommentReady ? (
						<Fragment>
						  {/* 第一段列表 */}
						  {isCommentReady && isShowCommentList && (
							<Fragment>
							  <RenderCommentList
								isPositionComment={true}
								sort={flag => this.onSortChange(flag)}
								replyAvatarClick={(comment, reply, floor) => this.replyAvatarClick(comment, reply, floor)}
							  ></RenderCommentList>
							  {!isCommentPositionNoMore && (
							  // <BottomView
							  //   onClick={() => this.onLoadMoreClick()}
							  //   noMoreType="line"
							  //   loadingText="点击加载更多"
							  //   isError={isCommentListError}
							  //   noMore={isCommentPositionNoMore}
							  // ></BottomView>

								<div className={layout.showMore} onClick={() => this.onLoadMoreClick()}>
								  <div className={layout.hidePercent}>展开更多评论</div>
								  <Icon className={layout.icon} name="RightOutlined" size={12} />
								</div>
							  )}
							</Fragment>
						  )}

						  {/* 第二段列表 */}
						  <RenderCommentList
							canPublish={this.props.canPublish}
							positionRef={this.positionRef}
							showHeader={!isShowCommentList}
							sort={flag => this.onSortChange(flag)}
							onEditClick={comment => this.onEditClick(comment)}
							replyAvatarClick={(comment, reply, floor) => this.replyAvatarClick(comment, reply, floor)}
						  ></RenderCommentList>
						  <BottomView noMoreType="line" isError={isCommentListError} noMore={isNoMore}></BottomView>
						</Fragment>
					  ) : (
						<LoadingTips isError={isCommentListError} type="init"></LoadingTips>
					  )}
					</div>
				  )}
			</>
		  )}
          <Copyright marginTop={0} />
        </div>

        {/* 底部操作栏 */}
        {isReady && isApproved && (
          <div className={layout.footerContainer}>
            <div className={layout.footer}>
              {/* 评论区触发 */}
			  {webConfig.setSite.siteComment[1].value && (
				  <div
					className={classNames(footer.inputClick, hasHongbao && footer.hasHongbao)}
					onClick={() => this.onInputClick()}
				  >
					{hasHongbao && <img className={footer.hongbaoMini} src={hongbaoMini}></img>}
					<Input className={footer.input} placeholder="写评论" disabled={true} prefixIcon="EditOutlined"></Input>
				  </div>
			  )}

              {/* 操作区 */}
              <div className={footer.operate}>
                <div className={footer.icon} onClick={() => this.onMessageClick()}>
                  {this.state.stateFlag
                    ? totalCount > 0 ? (
                      <div className={classNames(footer.badge, totalCount < 10 && footer.isCricle)}>
                        {totalCount > 99 ? '99+' : `${totalCount || '0'}`}
                      </div>
                    ) : (
                      ''
                    ) : (
                      <div className={footer.content}>
                        正文
                      </div>
                    )}
                  <Icon size="20" name="MessageOutlined"></Icon>
                </div>
                <Icon
                  className={classNames(footer.icon, {
                    [footer.isliked]: this.props.thread?.threadData?.isLike,
                  })}
                  onClick={debounce(() => this.onLikeClick(), 500)}
                  size="20"
                  name="LikeOutlined"
                ></Icon>
                <Icon
                  className={classNames(footer.icon, {
                    [footer.isliked]: this.props.thread?.isFavorite,
                  })}
                  onClick={debounce(() => this.onCollectionClick(), 500)}
                  size="20"
                  name="CollectOutlinedBig"
                ></Icon>
                <Icon
                  onClick={immediateDebounce(() => this.handleClick(), 1000)}
                  className={footer.icon}
                  size="20"
                  name="ShareAltOutlined"
                ></Icon>
              </div>
            </div>
          </div>
        )}
        <MorePopop
          show={this.state.show}
          onClose={this.onShareClose}
          handleH5Share={this.handleH5Share}
          handleWxShare={this.handleWxShare}
          createCard={this.createCard}
        ></MorePopop>
        {isReady && (
          <Fragment>
            {/* 评论弹层 */}
            <InputPopup
              visible={this.state.showCommentInput}
              onClose={() => this.onClose()}
              initValue={this.state.inputValue}
              onSubmit={(value, imgList) => this.onPublishClick(value, imgList)}
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
            ></MorePopup>

            {/* 删除弹层 */}
            <DeletePopup
              visible={this.state.showDeletePopup}
              onClose={() => this.setState({ showDeletePopup: false })}
              onBtnClick={type => this.onBtnClick(type)}
              type='thread'
            ></DeletePopup>
            {/* 举报弹层 */}

            {/* 举报弹窗 */}
            <ReportPopup
              reportContent={this.reportContent}
              inputText={this.inputText}
              visible={this.state.showReportPopup}
              onCancel={() => this.setState({ showReportPopup: false })}
              onOkClick={data => this.onReportOk(data)}
            ></ReportPopup>

            {/* 打赏弹窗 */}
            <RewardPopup
              visible={this.state.showRewardPopup}
              onCancel={() => this.setState({ showRewardPopup: false })}
              onOkClick={value => this.onRewardSubmit(value)}
            ></RewardPopup>

            {/* 微信浏览器内分享弹窗 */}
            {this.state.loadWeiXin && (
              <SharePopup
                visible={this.state.isShowWeiXinShare}
                onClose={() => this.setState({ isShowWeiXinShare: false })}
                type="thread"
              />
            )}
          </Fragment>
        )}
      </div>
    );
  }
}

export default HOCTencentCaptcha(ThreadH5Page);
