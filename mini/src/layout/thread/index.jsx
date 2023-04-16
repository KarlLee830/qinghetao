import React, { Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { View, Text, ScrollView, Image } from '@tarojs/components';

import Taro, { eventCenter, getCurrentInstance } from '@tarojs/taro';

import layout from './layout.module.scss';
import footer from './footer.module.scss';

import NoMore from './components/no-more';
import LoadingTips from './components/loading-tips';
// import styleVar from '@common/styles/theme/default.scss.json';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Input from '@discuzqsdk/design/dist/components/input/index';
import Toast from '@components/toast';
import Button from '@discuzqsdk/design/dist/components/button/index';
import goToLoginPage from '@common/utils/go-to-login-page';

import AboptPopup from './components/abopt-popup';
import ReportPopup from './components/report-popup';
import ShowTop from './components/show-top';
import DeletePopup from './components/delete-popup';
import MorePopup from './components/more-popup';
import InputPopup from './components/input-popup';
import BottomView from '@components/list/BottomView';
import throttle from '@common/utils/thottle';
import PacketOpen from '@components/red-packet-animation';

import threadPay from '@common/pay-bussiness/thread-pay';
import RewardPopup from './components/reward-popup';
import RenderThreadContent from './detail/content';
import RenderCommentList from './detail/comment-list';
import classNames from 'classnames';
import { debounce } from '@common/utils/throttle-debounce';
import styles from './post/index.module.scss';
import Router from '@discuzqsdk/sdk/dist/router';
import canPublish from '@common/utils/can-publish';
import { parseContentData } from './utils';
import { IMG_SRC_HOST } from '@common/constants/site';

const hongbaoMini = `${IMG_SRC_HOST}/assets/redpacket-mini.10b46eefd630a5d5d322d6bbc07690ac4536ee2d.png`;

@inject('site')
@inject('user')
@inject('thread')
@inject('commentPosition')
@inject('comment')
@inject('index')
@inject('payBox')
@observer
class ThreadH5Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAboptPopup: false, // 是否弹出采纳弹框
      isShowShare: false, // 更多弹框是否显示分享
      showReportPopup: false, // 是否弹出举报弹框
      showDeletePopup: false, // 是否弹出删除弹框
      showCommentInput: false, // 是否弹出评论框
      showMorePopup: false, // 是否弹出更多框
      showRewardPopup: false, // 打赏弹窗
      isCommentLoading: false, // 列表loading
      setTop: false, // 置顶
      showContent: '',
      // inputValue: '', // 评论内容
      inputText: '请输入内容', // 默认回复框placeholder内容
      toView: '', // 接收元素id用来滚动定位
      stateFlag: true,
    };

    this.perPage = 20;
    this.commentDataSort = true;

    // 滚动定位相关属性
    this.position = 0;
    this.threadBodyRef = React.createRef();
    this.commentDataRef = React.createRef();
    this.nextPosition = 0;
    this.flag = true;
    this.currentPosition = 0;

    // 修改评论数据
    this.comment = null;

    this.commentData = null;
    this.replyData = null;
    this.commentType = null;

    // 举报内容选项
    this.reportContent = ['广告垃圾', '违规内容', '恶意灌水', '重复发帖'];
    this.inputText = '其他理由...';
    this.$instance = getCurrentInstance()

    this.positionRef = React.createRef();
    this.isPositioned = false;
  }

  componentWillMount() {
    const onShowEventId = this.$instance.router.onShow
    // 监听
    eventCenter.on(onShowEventId, this.onShow.bind(this))
  }
  componentDidMount() {
    // 当内容加载完成后，获取评论区所在的位置
    // this.position = this.commentDataRef?.current?.offsetTop - 50;
    // 是否定位到评论位置
    if (this.props?.thread?.isPositionToComment) {
      // TODO:需要监听帖子内容加载完成事件
      setTimeout(() => {
        this.onMessageClick();
      }, 1200);
    }
  }

  componentDidUpdate() {
    // 当内容加载完成后，获取评论区所在的位置
    if (this.props.thread.isReady) {
      // this.position = this.commentDataRef?.current?.offsetTop - 50;

      const { id, title } = this.props?.thread?.threadData;

      if (id) {
        // 分享相关数据
        this.shareData = {
          comeFrom: 'thread',
          threadId: id,
          title,
          path: `/indexPages/thread/index?id=${id}`,
        };
      }
    }

    // 滚动到指定的评论定位位置
    if (this.props.commentPosition?.postId && !this.isPositioned && this.positionRef?.current) {
      this.isPositioned = true;
      setTimeout(() => {
        this.setState({
          toView: `position${this.props.commentPosition?.postId}`,
        });
      }, 1000);
    }
  }

  componentWillUnmount() {
    // 清空数据
    this.props?.thread && this.props.thread.reset();
    // 关闭付费弹窗盒子
    this.props?.payBox?.hide();
    // 清空@ren数据
    this.props.thread.setCheckUser([]);
    const onShowEventId = this.$instance.router.onShow
    // 卸载
    eventCenter.off(onShowEventId, this.onShow)
  }

  // 滚动事件
  handleOnScroll = (e) => {
    // 加载评论列表
    if (this.state.toView !== '') {
      this.setState({ toView: '' });
    }

    if (this.flag) {
      this.nextPosition = 0;
    }
    this.currentPosition = e.detail?.scrollTop || 0;

    // 数据预加载
    const { scrollLeft, scrollTop, scrollHeight, scrollWidth, deltaX, deltaY } = e.detail;
    if (scrollTop * 3 > scrollHeight) {
      const id = this.props.thread?.threadData?.id;
      const params = {
        id,
        page: this.props.thread.page + 1,
        perPage: this.perPage,
        sort: this.commentDataSort ? 'createdAt' : '-createdAt',
      };

      this.props.thread.preFetch(params);
    }
  };

  // 触底事件
  scrollToLower = () => {
    const { isCommentReady, isNoMore } = this.props.thread;
    if (!this.state.isCommentLoading && isCommentReady && !isNoMore) {
      this.props.thread.setCommentListPage(this.props.thread.page + 1);
      this.loadCommentList();
    }
  };

  // 点击信息icon
  onMessageClick() {
    this.setState({ toView: 'commentId' });
    if (this.flag) {
      this.flag = !this.flag;
    } else {
      if (this.position <= 0) {
        this.position = this.nextPosition + 1;
      } else {
        this.position = this.nextPosition - 1;
      }
      this.flag = !this.flag;
    }
    this.setState({ stateFlag: this.flag })
  }

  // 点击收藏icon
  async onCollectionClick() {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/userPages/user/wx-auth/index' });
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
    const { isCommentReady, isCommentListError } = this.props.thread;
    if (this.state.isCommentLoading || (!isCommentReady && !isCommentListError)) {
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

  // 列表排序
  onSortChange(isCreateAt) {
    this.commentDataSort = isCreateAt;
    this.props.thread.setCommentListPage(1);
    this.props.commentPosition.reset();
    return this.loadCommentList();
  }

  // 点击评论
  onInputClick() {
    const {user, site, thread } = this.props;
    if (!user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/userPages/user/wx-auth/index' });
      return;
    }
    if(!canPublish(user, site, 'reply', thread?.threadData?.threadId)) return;
    this.commentType = 'comment';

    this.setState({
      showCommentInput: true,
      inputText: '请输入内容',
    });
  }

  // 点击更多icon
  onMoreClick = () => {
    // this.setState({
    //   text: !this.state.text,
    // });
    this.setState({
      isShowShare: false,
      showMorePopup: true,
    });
  };

  // 点击分享
  onShareClick = () => {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/userPages/user/wx-auth/index' });
      return;
    }

    this.setState({
      isShowShare: true,
      showMorePopup: true,
    });
  };

  onOperClick = (type) => {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/userPages/user/wx-auth/index' });
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
      Taro.redirectTo({
        url: `/indexPages/thread/post/index?id=${this.props.thread?.threadData?.id}}`,
      });
    }

    // 举报
    if (type === 'report') {
      this.setState({ showReportPopup: true });
    }

    // 收藏
    if (type === 'collect') {
      this.onCollectionClick();
    }

    // 生成海报
    if (type === 'posterShare') {
      this.onPosterShare();
    }

    // wx分享
    if (type === 'wxShare') {
      this.onWxShare();
    }
  };

  // 生成海报
  async onPosterShare() {
    const threadId = this.props.thread?.threadData?.id;
    const threadData = this.props.thread?.threadData;

    const { success, msg } = await this.props.thread.shareThread(threadId, this.props.index, this.props.search, this.props.topic);
    if (!success) {
      Toast.error({
        content: msg,
      });
    }
    Taro.eventCenter.once('page:init', () => {
      Taro.eventCenter.trigger('message:detail', threadData);
    });
    Taro.navigateTo({
      url: `/subPages/create-card/index?threadId=${threadId}`,
    });
  }

  // wx分享
  onWxShare() {
    const { thread, user } = this.props
    const { nickname } = thread.threadData?.user || ''
    const { avatar } = thread.threadData?.user || ''
    const threadId = thread?.threadData?.id
    if (thread.threadData?.isAnonymous) {
      user.getShareData({ nickname, avatar, threadId })
      thread.threadData.user.nickname = '匿名用户'
      thread.threadData.user.avatar = ''
    }
  }
  onShow() {
    const { thread, user } = this.props
    if (user.shareThreadid === thread?.threadData?.id) {
      if (thread.threadData?.isAnonymous) {
        thread.threadData.user.nickname = user.shareNickname
        thread.threadData.user.avatar = user.shareAvatar
        user.getShareData({})
      }
    }
  }
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
      // TODO:更新首页置顶列表
      this.props.index.screenData({});
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
        content: '删除成功，即将跳转至上一页',
      });
      this.props.index.deleteThreadsData({ id }, this.props.site);
      setTimeout(() => {
        Taro.navigateBack({
          delta: 1,
          fail:()=>{
            Taro.navigateTo({
              url: '/indexPages/home/index',
            });
          }
        });
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
  async publishClick(data) {
    if (this.commentType === 'comment') {
      return await this.onPublishClick(data);
    }
    if (this.commentType === 'reply') {
      return await this.createReply(data);
    }
  }

  // 发布评论
  async onPublishClick(data) {
    return this.comment ? await this.updateComment(data) : await this.createComment(data);
  }

  // 创建评论
  async createComment({ val, imageList, captchaTicket, captchaRandStr }) {
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
        .filter((item) => item.status === 'success' && item.response)
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

      // 是否红包帖
      const isRedPack = this.props.thread?.threadData?.displayTag?.isRedPack;
      // TODO:可以进一步细化判断条件，是否还有红包
      if (isRedPack) {
        // 评论获得红包帖，更新帖子数据
        await this.props.thread.fetchThreadDetail(id);
      }

      if (redPacketAmount && redPacketAmount > 0) {
        this.props.thread.setRedPacket(redPacketAmount);
      }

      // 更新列表store数据
      this.props.thread.updateListStore();

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
  async updateComment({val, captchaTicket = '', captchaRandStr = '' }) {
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

  // 点击评论的回复
  replyClick(comment) {
    const {user, site, thread } = this.props;
    if (!user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/userPages/user/wx-auth/index' });
      return;
    }
    if(!canPublish(user, site, 'reply', thread?.threadData?.threadId)) return;
    this.commentType = 'reply';

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
      goToLoginPage({ url: '/userPages/user/wx-auth/index' });
      return;
    }
    this.commentType = 'reply';

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
  async createReply({val = '', imageList = [], captchaTicket = '', captchaRandStr = ''}) {
    if (!val && imageList.length === 0) {
      Toast.info({ content: '请输入内容!' });
      return;
    }

    const id = this.props.thread?.threadData?.id;
    if (!id) return;

    const params = {
      id,
      content: val,
      captchaTicket,
      captchaRandStr,
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

    const { success, msg, isApproved } = await this.props.comment.createReply(params, this.props.thread);

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

  replyAvatarClick(reply, comment, floor) {
    if (floor === 2) {
      const { userId } = reply;
      if (!userId) return;
      Router.push({ url: `/userPages/user/index?id=${userId}` });
    }
    if (floor === 3) {
      const { commentUserId } = reply;
      if (!commentUserId) return;
      Router.push({ url: `/userPages/user/index?id=${commentUserId}` });
    }
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
      goToLoginPage({ url: '/userPages/user/wx-auth/index' });
      return;
    }

    const id = this.props.thread?.threadData?.id;
    const params = {
      id,
      pid: this.props.thread?.threadData?.postId,
      isLiked: !this.props.thread?.threadData?.isLike,
    };
    const { success, msg } = await this.props.thread.updateLiked(params, this.props.index, this.props.user);

    if (!success) {
      Toast.error({
        content: msg,
      });
    }
  }

  // 付费支付
  async onPayClick() {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/userPages/user/wx-auth/index' });
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
      goToLoginPage({ url: '/userPages/user/wx-auth/index' });
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
        this.props.user
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
    Taro.redirectTo({
      url: '/indexPages/home/index',
    });
  }

  // 点击采纳
  onAboptClick(data) {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/userPages/user/wx-auth/index' });
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
        await this.props.thread.fetchThreadDetail(params.threadId);
        this.props.thread.updateListStore();

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

  onRetryClick() {
    this.loadCommentList()
  }

  render() {
    const { thread: threadStore } = this.props;
    const { isReady, isCommentReady, isNoMore, totalCount, isCommentListError } = threadStore;
    const { hasRedPacket } = threadStore; // 是否有红包领取的数据

    const fun = {
      moreClick: this.onMoreClick,
    };

    const { indexes } = this.props.thread?.threadData?.content || {};
    const parseContent = parseContentData(indexes);
    const hasHongbao = parseContent?.RED_PACKET?.condition===0 && parseContent?.RED_PACKET?.remainNumber>0; // 是否还有剩余未领完红包

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
    const { webConfig } = this.props.site;

    // 定位评论相关
    const { isShowCommentList, isNoMore: isCommentPositionNoMore } = this.props.commentPosition;

    return (
      <View className={layout.container}>
        <View className={layout.header}>
          {/* <Header></Header> */}
          {isReady && !isApproved && (
            <View className={layout.examine}>
              <Icon className={layout.tipsIcon} name="TipsOutlined"></Icon>
              <Text className={layout.tipsText}>内容正在审核中，审核通过后才能正常显示！</Text>
            </View>
          )}
        </View>
        <ScrollView
          className={layout.body}
          ref={this.hreadBodyRef}
          id="hreadBodyId"
          scrollY
          scrollTop={this.position}
          lowerThreshold={50}
          onScrollToLower={this.props.index.hasOnScrollToLower ? () => this.scrollToLower() : null}
          scrollIntoView={this.state.toView}
          onScroll={(e) => throttle(this.handleOnScroll(e), 200)}
        >
          <View className={layout['view-inner']}>
            <ShowTop showContent={this.state.showContent} setTop={this.state.setTop}></ShowTop>
            {/* 帖子内容 */}
            {isReady ? (
              <RenderThreadContent
                store={threadStore}
                fun={fun}
                onLikeClick={debounce(() => this.onLikeClick(), 500)}
                onOperClick={(type) => this.onOperClick(type)}
                onCollectionClick={debounce(() => this.onCollectionClick(), 500)}
                onReportClick={() => this.onReportClick()}
                onContentClick={debounce(() => this.onContentClick(), 500)}
                onRewardClick={() => this.onRewardClick()}
                onTagClick={() => this.onTagClick()}
                onPayClick={() => this.onPayClick()}
              ></RenderThreadContent>
            ) : (
              <LoadingTips type="init"></LoadingTips>
            )}

            {/* 评论列表 */}
            {webConfig.setSite.siteComment[2].value && (
              <>
                {isReady && isApproved && (
                  <View className={`${layout.bottom}`} ref={this.commentDataRef} id="commentId">
                    {isCommentReady ? (
                      <Fragment>
                        {/* 第一段列表 */}
                        {isCommentReady && isShowCommentList && (
                          <Fragment>
                            <RenderCommentList
                              isPositionComment
                              router={this.props.router}
                              sort={(flag) => this.onSortChange(flag)}
                              replyAvatarClick={(comment, reply, floor) => this.replyAvatarClick(comment, reply, floor)}
                            ></RenderCommentList>
                            {!isCommentPositionNoMore && (
                              <View className={layout.showMore} onClick={() => this.onLoadMoreClick()}>
                                <View className={layout.hidePercent}>展开更多评论</View>
                                <Icon className={layout.icon} name="RightOutlined" size={12} />
                              </View>
                            )}
                          </Fragment>
                        )}

                        <RenderCommentList
                          positionRef={this.positionRef}
                          showHeader={!isShowCommentList}
                          router={this.props.router}
                          sort={(flag) => this.onSortChange(flag)}
                          replyReplyClick={(reply, comment) => this.replyReplyClick(reply, comment)}
                          replyClick={(comment) => this.replyClick(comment)}
                          replyAvatarClick={(comment, reply, floor) => this.replyAvatarClick(comment, reply, floor)}
                          onAboptClick={(data) => this.onAboptClick(data)}
                        ></RenderCommentList>
                        <View className={layout.noMore}>
                          <BottomView type="line" isError={isCommentListError} noMore={isNoMore}></BottomView>
                        </View>
                      </Fragment>
                    ) : (
                      <LoadingTips isError={isCommentListError} type="init" onErrorClick={() => this.onRetryClick()}></LoadingTips>
                    )}
                  </View>
                )}
              </>
             )}
             {/* 底部操作栏 */}
              {isReady && isApproved && (
                <View className={classNames(layout.footerContainer, this.state.showCommentInput && layout.zindex)}>
                  <View className={classNames(layout.footer, this.state.showCommentInput && layout.zindex)}>
                    {/* 评论区触发 */}
                    {webConfig.setSite.siteComment[2].value && (
                      <View
                        className={classNames(footer.inputClick, hasHongbao && footer.hasHongbao)}
                        onClick={() => this.onInputClick()}
                      >
                        {hasHongbao && <Image className={footer.hongbaoMini} src={hongbaoMini}></Image>}
                        <Input
                          className={footer.input}
                          placeholder="写评论"
                          disabled
                          prefixIcon="EditOutlined"
                          placeholderClass={footer.inputPlaceholder}
                        ></Input>
                      </View>
                    )}

                    {/* 操作区 */}
                    <View className={footer.operate}>
                      <View className={footer.icon} onClick={() => this.onMessageClick()}>
                        {this.state.stateFlag ?
                          totalCount > 0 ? (
                            <View className={classNames(footer.badge, totalCount < 10 && footer.isCricle)}>
                              {totalCount > 99 ? '99+' : `${totalCount || '0'}`}
                            </View>
                          ) : (
                            ''
                          ) : (
                            <View className={footer.content}>
                              正文
                            </View>
                          )}
                        <Icon size="20" name="MessageOutlined"></Icon>
                      </View>
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

                      {/* 分享button */}
                      <View className={classNames(footer.share, footer.icon)} onClick={() => this.onShareClick()}>
                        <Icon className={footer.icon} size="20" name="ShareAltOutlined"></Icon>
                      </View>
                    </View>
                  </View>
                </View>
              )}

          </View>
        </ScrollView>

        {isReady && (
          <Fragment>
            {/* 评论弹层 */}
            <InputPopup
              mark={'detail'}
              inputText={this.state.inputText}
              visible={this.state.showCommentInput}
              onClose={() => this.onClose()}
              initValue={this.state.inputValue}
              onSubmit={data => this.publishClick(data)}
              site={this.props.site}
              checkUser={this.props?.thread?.checkUser || []}
              thread={this.props?.thread}
            ></InputPopup>

            {/* 更多弹层 */}
            <MorePopup
              shareData={this.shareData}
              permissions={morePermissions}
              statuses={moreStatuses}
              visible={this.state.showMorePopup}
              onClose={() => this.setState({ showMorePopup: false })}
              onSubmit={() => this.setState({ showMorePopup: false })}
              onOperClick={(type) => this.onOperClick(type)}
              isShowShare={this.state.isShowShare}
            ></MorePopup>

            {/* 删除弹层 */}
            <DeletePopup
              visible={this.state.showDeletePopup}
              onClose={() => this.setState({ showDeletePopup: false })}
              onBtnClick={(type) => this.onBtnClick(type)}
              type="thread"
            ></DeletePopup>

            {/* 举报弹窗 */}
            <ReportPopup
              reportContent={this.reportContent}
              inputText={this.inputText}
              visible={this.state.showReportPopup}
              onCancel={() => this.setState({ showReportPopup: false })}
              onOkClick={(data) => this.onReportOk(data)}
            ></ReportPopup>

            {/* 打赏弹窗 */}
            <RewardPopup
              visible={this.state.showRewardPopup}
              onCancel={() => this.setState({ showRewardPopup: false })}
              onOkClick={(value) => this.onRewardSubmit(value)}
            ></RewardPopup>

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

            {
              hasRedPacket > 0
              && <PacketOpen onClose={() => threadStore.setRedPacket(0)} money={hasRedPacket} />
            }
          </Fragment>
        )}
      </View>
    );
  }
}

export default ThreadH5Page;
