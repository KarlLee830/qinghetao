/* eslint-disable spaced-comment */
import React, { Component } from 'react';
import Taro, { getCurrentInstance } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import { observer, inject } from 'mobx-react';
import { PluginToolbar, DefaultToolbar, GeneralUpload, Title, Content, ClassifyPopup, OptionPopup, Position, Emoji } from '@components/thread-post';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import { Units } from '@components/common';
import styles from './index.module.scss';
import { THREAD_TYPE, MAX_COUNT, THREAD_STATUS } from '@common/constants/thread-post';
import { paidOption, draftOption } from '@common/constants/const';
import { readYundianboSignature } from '@common/server';
import VodUploader from 'vod-wx-sdk-v2';
import { toTCaptcha } from '@common/utils/to-tcaptcha';
import PayBox from '@components/payBox/index';
import { ORDER_TRADE_TYPE } from '@common/constants/payBoxStoreConstants';
import { get } from '@common/utils/get';
import { formatDate } from '@common/utils/format-date';
import * as localData from '@common/utils/thread-post-localdata';
import TagLocalData from '@components/thread-post/tag-localdata';
import VoteWidget from '@components/thread-post/vote-widget';
import typeofFn from '@common/utils/typeof';
import DZQPluginCenterInjection from '@discuzqsdk/plugin-center/dist/components/DZQPluginCenterInjection';
import Dialog from '@discuzqsdk/design/dist/components/dialog/index';

// 插件引入
/**DZQ->plugin->register<plugin_post@post_extension_content_hook>**/

@inject('payBox')
@inject('index')
@inject('site')
@inject('plugin')
@inject('user')
@inject('thread')
@inject('threadPost')
@observer
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      threadId: '', // 主题id
      postType: 'isFirst', // 发布状态 isFirst-首次，isEdit-再编辑，isDraft-草稿
      canEditRedpacket: true, // 可编辑红包
      canEditReward: true, // 可编辑悬赏
      isShowTitle: true, // 默认显示标题
      isSavingDraft: false, // 当前是否在保存草稿流程中，用于临时给保存草稿流程使用
      maxLength: 5000, // 文本输入最大长度
      showClassifyPopup: false, // 切换分类弹框show
      operationType: 0,
      contentTextLength: MAX_COUNT,
      showEmoji: false,
      showPaidOption: false, // 显示付费选项弹框
      showDraftOption: false, // 显示草稿选项弹框
      data: {},
      pluginDialogShow: false,
      pluginDialogContent: null
    }
    this.timer = null;
    this.ticket = ''; // 腾讯云验证码返回票据
    this.randstr = ''; // 腾讯云验证码返回随机字符串
    this.contentRef = React.createRef(null);

    this.showPluginDialog = this.showPluginDialog.bind(this);
    this.closePluginDialog = this.closePluginDialog.bind(this);
  }

  componentWillMount() { }


  async componentDidMount() {
    this.getNavHeight();
    this.redirectToHome();
    await this.fetchCategories(); // 请求分类
    const { params } = this.inst.router;
    const id = parseInt(params.id);
    if (id) { // 请求主题
      this.setState({ threadId: id })
      this.setPostDataById(id);
    } else {
      this.props.threadPost.setThreadStatus(THREAD_STATUS.create);
      this.setCategory();
    }
    this.openSaveDraft();
    if (this.getPostDataFromLocal()) this.props.threadPost.setLocalDataStatus(true);
    // 监听腾讯验证码事件
    Taro.eventCenter.on('captchaResult', this.handleCaptchaResult);
    Taro.eventCenter.on('closeChaReault', this.handleCloseChaReault);
  }

  componentDidUpdate() {
    this.redirectToHome();
  }

  componentWillUnmount() {
    // 卸载发帖页时清理定时器、事件监听、重置发帖数据
    const { resetPostData } = this.props.threadPost;
    resetPostData();
    if (this.timer) clearInterval(this.timer);
    Taro.eventCenter.off('captchaResult', this.handleCaptchaResult);
    Taro.eventCenter.off('closeChaReault', this.handleCloseChaReault);
    this.props.thread.reset();
  }

  inst = getCurrentInstance();

  // 验证码滑动成功的回调
  handleCaptchaResult = (result) => {
    const { setPostData } = this.props.threadPost;
    setPostData({
      captchaTicket: result.ticket,
      captchaRandStr: result.randstr,
    });
    const { router } = this.inst;
    // 当前页面才进行提交操作，避免其他页面引起的多余的提交
    if (router.path.indexOf('indexPages/thread/post/index') > -1) {
      this.state.isSavingDraft ? this.handleSaveDraft(true) : this.handleSubmit(false, true);
    }
    this.setState({
      isSavingDraft: false
    })
  }

  // 验证码点击关闭的回调
  handleCloseChaReault = () => {
    Taro.hideLoading();

    this.setState({
      isSavingDraft: false
    })
  }

  // 插件使用弹窗
  showPluginDialog(component) {
    this.setState({
      pluginDialogShow: true,
      pluginDialogContent: component
    })
  }

  // 插件使用弹窗
  closePluginDialog() {
    this.setState({
      pluginDialogShow: false,
      pluginDialogContent: null
    })
  }

  getNavHeight() {
    const { statusBarHeight } = Taro.getSystemInfoSync();
    const menubtnRect = Taro.getMenuButtonBoundingClientRect();
    const { top = 0, height = 0, width = 0 } = menubtnRect || {};
    const navHeight = (top - statusBarHeight) * 2 + height;
    this.props.threadPost.setNavInfo({ statusBarHeight, navHeight, menubtnWidth: width })
  }

  // handle
  postToast = (title, icon = 'none', duration = 2000) => { // toast
    Taro.showToast({ title, icon, duration });
  }

  redirectToHome = () => { // 检查发帖权限，没有则重定向首页
    const { permissions } = this.props.user;
    if (permissions && permissions.createThread && !permissions.createThread.enable) {
      this.postToast('暂无发帖权限, 即将回到首页');
      setTimeout(() => {
        Taro.redirectTo({ url: '/indexPages/home/index' })
      }, 1000)
    }
  }

  async fetchCategories() { // 若当前store内分类列表数据为空，则主动请求分类
    const { readPostCategory } = this.props.threadPost;
    const { params } = this.inst.router;
    // const categories = this.props.threadPost?.getCurrentCategories();
    await readPostCategory(params.id);
  }

  async setPostDataById(id) {
    const { thread, threadPost } = this.props;
    let ret = {};

    // 再编辑时，含有主题数据，直接使用
    if (id === thread.threadData?.id && thread.threadData) {
      ret.data = thread.threadData;
      ret.code = 0;
    } else {
      ret = await thread.fetchThreadDetail(id);
    }

    if (ret.code === 0) {
      // 请求成功，设置分类，发帖数据,发帖状态，草稿状态开启自动保存
      const { categoryId, isDraft } = ret.data;
      const { content: { text } } = ret.data;
      // 小程序编辑帖子，要把内容中的img标签去掉。/todo: 防止把其他有效的img标签也去掉
      const realText = text.replace(/<img.*?alt="(\w+)".*?>/g, `:$1:`)
        .replace(/<br \/>/g, '\n')
        .replace(/<span.*?>(.*?)<\/span>/g, `$1`);
      ret.data.content.text = realText;
      // const { isThreadPaid } = this.props.threadPost
      // if (isThreadPaid) {
      //   this.postToast('已经支付的帖子不支持编辑');
      //   const timer = setTimeout(() => {
      //     clearTimeout(timer);
      //     Taro.redirectTo({ url: `/indexPages/thread/index?id=${id}` });
      //   }, 1000);
      //   return;
      // }
      // 更改交互：已发布帖子可以编辑内容，但是不能编辑红包或者悬赏属性
      this.setState({
        postType: isDraft ? 'isDraft' : 'isEdit',
        canEditRedpacket: isDraft,
        canEditReward: isDraft,
      });
      const status = isDraft ? THREAD_STATUS.draft : THREAD_STATUS.edit;
      threadPost.setThreadStatus(status);
      threadPost.formatThreadDetailToPostData(ret.data, true);

      this.setCategory(categoryId);
      // isDraft && this.openSaveDraft(); // 现阶段，自动保存功能关闭
    } else {
      // 请求失败，弹出错误消息
      this.postToast(ret.msg);
    }
  }

  setCategory(categoryId) { // 设置当前主题已选分类
    const categorySelected = this.props.threadPost.getCategorySelectById(categoryId);
    this.props.threadPost.setCategorySelected(categorySelected);
  }

  saveDataLocal = () => {
    const { threadPost, user } = this.props;
    localData.setThreadPostDataLocal({ postData: threadPost.postData, userId: user.userInfo.id });
  };

  // 从本地缓存中获取数据
  getPostDataFromLocal = () => localData.getThreadPostDataLocal(
    this.props.user.userInfo?.id,
    this.inst.router.params.id,
  );

  removeLocalData = () => {
    localData.removeThreadPostDataLocal();
  }

  openSaveDraft = () => {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.autoSaveDraft();
    }, 30000)
  }

  autoSaveDraft = async () => {
    const { setPostData } = this.props.threadPost;
    if (this.isHaveContent()) {
      this.saveDataLocal();
      const now = formatDate(new Date(), 'hh:mm');
      setPostData({ autoSaveTime: now });
    }
  }

  // 监听title输入
  onTitleChange = (title) => {
    const { setPostData } = this.props.threadPost;
    setPostData({ title });
  }

  // 处理文本框内容
  onContentChange = (contentText, maxLength) => {
    const { setPostData } = this.props.threadPost;
    setPostData({ contentText });
    this.toHideTitle();
    this.setState({
      contentTextLength: maxLength - contentText.length
    });
  }

  resetOperationType() {
    this.setState({
      operationType: ''
    });
  }

  // 点击发帖插件时回调，如上传图片、视频、附件或艾特、话题等
  handlePluginClick(item) {
    // 检查是否录音中
    if (!this.checkAudioRecordStatus()) return;

    // 再点击附件、图片、和录音图标时候，如果当时进行中的正式该操作，则进行重置
    const { operationType } = this.state;
    if ([THREAD_TYPE.file, THREAD_TYPE.image, THREAD_TYPE.voice].includes(item.type) && item.type === operationType) {
      this.resetOperationType();
      return;
    }

    const { postData } = this.props.threadPost;

    this.setState({
      operationType: item.type
    });

    if (item.type !== THREAD_TYPE.emoji) {
      this.setState({
        showEmoji: false
      });
    }

    let nextRoute;
    switch (item.type) {
      // 根据类型分发具体操作
      case THREAD_TYPE.reward:
        if (!this.state.canEditReward) {
          return this.postToast('再编辑时不可操作悬赏');
        }
        nextRoute = '/indexPages/thread/selectReward/index';
        this.resetOperationType();
        break;
      case THREAD_TYPE.goods:
        nextRoute = '/indexPages/thread/selectProduct/index';
        this.resetOperationType();
        break;
      case THREAD_TYPE.redPacket:
        this.resetOperationType();
        if (!this.state.canEditRedpacket) {
          return this.postToast('再编辑时不可操作红包');
        }
        nextRoute = '/indexPages/thread/selectRedpacket/index';
        break;
      case THREAD_TYPE.vote:
        this.resetOperationType();
        if (postData.vote.voteUsers > 0) {
          return this.postToast('投票已生效，不允许编辑');
        }
        nextRoute = '/indexPages/thread/voteEditor/index';
        break;
      case THREAD_TYPE.paid:
        this.setState({ showPaidOption: true });
        this.resetOperationType();
        break;
      case THREAD_TYPE.paidPost:
        nextRoute = `/indexPages/thread/selectPayment/index?paidType=${THREAD_TYPE.paidPost}`;
        this.setState({ showPaidOption: false })
        break;
      case THREAD_TYPE.paidAttachment:
        nextRoute = `/indexPages/thread/selectPayment/index?paidType=${THREAD_TYPE.paidAttachment}`;
        this.setState({ showPaidOption: false });
        break;
      case THREAD_TYPE.at:
        nextRoute = '/indexPages/thread/selectAt/index';
        break;
      case THREAD_TYPE.topic:
        nextRoute = '/indexPages/thread/selectTopic/index';
        break;
      case THREAD_TYPE.draft:
        this.setState({ showDraftOption: true });
        break;
      case THREAD_TYPE.saveDraft:
        this.setState({ showDraftOption: false }, () => this.handleSaveDraft(false));
        break;
      case THREAD_TYPE.abandonDraft:
        this.setState({ showDraftOption: false }, () => this.handlePageJump(true));
        break;
      case THREAD_TYPE.video:
        this.handleVideoUpload();
        postData.video.thumbUrl && this.props.pageScrollTo({ selector: '#thread-post-video' });
        break;
      case THREAD_TYPE.anonymity:
        if (postData.anonymous) this.props.threadPost.setPostData({ anonymous: 0 });
        else this.props.threadPost.setPostData({ anonymous: 1 });
        break;
      case THREAD_TYPE.emoji:
        this.setState({
          showEmoji: !this.state.showEmoji
        });
        this.props.pageScrollTo();
        break;
      case THREAD_TYPE.image:
        this.props.pageScrollTo({ selector: "#thread-post-image" });
        break;
      case THREAD_TYPE.voice:
        this.props.pageScrollTo({ selector: "#thread-post-voice" });
        break;
      case THREAD_TYPE.file:
        this.props.pageScrollTo({ selector: "#thread-post-file" });
        break;
    }
    if (nextRoute) {
      this.props.setRouterAction(item.type);
      Taro.navigateTo({ url: nextRoute });
    }
  }

  // 执行上传视频
  handleVideoUpload = () => {
    const { postData } = this.props.threadPost;
    if (postData.video?.id || postData.video?.threadVideoId) {
      this.postToast('只能上传一个视频');
      return;
    }
    Taro.chooseVideo({
      success: (file) => {
        this.yundianboUpload('video', file);
      },
      fail: (res) => {
        // this.postToast(res.errMsg);
      }
    });
  }

  // 执行云点播相关的上传工作
  yundianboUpload(type, file) {
    const { setPostData, createThreadVideoAudio } = this.props.threadPost;
    const { qcloudVodExt, qcloudVodSize} = this.props.site;

    let mediaFile = file;
    const { tempFilePath: name, imageType } = mediaFile;
    let prefix = imageType;
    if (!imageType) {
      const arr = (name || '')?.toLowerCase()?.split('.');
      prefix = arr[arr.length - 1];
    }
    if (qcloudVodExt && qcloudVodExt.indexOf(prefix) === -1) {
      Toast.info({ content: `仅支持${qcloudVodExt}类型的视频` });
      return false;
    }
    if (qcloudVodSize && qcloudVodSize * 1024 * 1024 < file.size) {
      Toast.info({ content: `上传视频大小在0到${qcloudVodSize}MB之间` });
      return false;
    }
    if (type === 'audio') {
      mediaFile = (({ fileSize: size, tempFilePath }) => ({ size, tempFilePath }))(file);
    }
    Taro.showLoading({
      title: '上传中',
      mask: true
    });
    VodUploader.start({
      mediaFile,
      // 必填，获取签名的函数
      getSignature: async (fn) => {
        const res = await readYundianboSignature();
        const { code, data } = res;
        if (code === 0) {
          fn(data.token);
        } else {
          Taro.showToast({
            title: '上传失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      // 上传中回调，获取上传进度等信息
      progress(result) {
      },
      // 上传完成回调，获取上传后的视频 URL 等信息
      finish: async (result) => {
        const { fileId, videoUrl: mediaUrl } = result;
        const params = { fileId, mediaUrl };
        if (type === 'audio') params.type = 1;
        const res = await createThreadVideoAudio(params);
        Taro.hideLoading();
        const { code, data } = res;
        if (code === 0) {
          if (type === 'video') {
            setPostData({
              video: {
                id: data?.id,
                thumbUrl: data.mediaUrl,
              },
            });
            this.props.pageScrollTo({ selector: '#thread-post-video' });
          } else if (type === 'audio') {
            setPostData({
              audio: {
                id: data?.id,
                mediaUrl: data.mediaUrl,
              },
              audioSrc: data.mediaUrl,
              audioRecordStatus: 'uploaded',
            });
          }
          this.resetOperationType();
        } else {
          Taro.showToast({
            title: res.msg,
            icon: 'none',
            duration: 2000
          });
        }
        // this.scrollerIntoView();
      },
      // 上传错误回调，处理异常
      error(result) {
        Taro.showToast({
          title: '上传失败',
          icon: 'none',
          duration: 2000
        });
        console.log('error');
        console.log(result);
      },
    });
  }


  // 红包tag展示
  redpacketContent = () => {
    const { postData, redpacketTotalAmount: amount } = this.props.threadPost;
    const { redpacket: { rule, number, condition, likenum } } = postData;
    return `${rule === 1 ? '随机红包' : '定额红包'}\\总金额${amount}元\\${number}个${condition === 1 && likenum > 0 ? `\\集赞个数${likenum}` : ''}`;
  }

  checkAttachPrice = () => {
    const { postData } = this.props.threadPost;
    // 附件付费设置了需要判断是否进行了附件的上传
    if (postData.attachmentPrice) {
      if (!(postData.audio.id || postData.video.id
        || Object.keys(postData.images)?.length
        || Object.keys(postData.files)?.length)) return false;
      return true;
    }
    return true;
  }

  isHaveContent() {
    const { postData } = this.props.threadPost;
    const { images, video, files, audio, vote, plugin } = postData;
    // todo, 应该还需要扩展当前插件是否可以无需文字
    if (!(postData.contentText || video.id || vote.voteTitle || audio.id || !typeofFn.isEmptyObject(plugin) || Object.values(images).length
      || Object.values(files).length)) {
      return false;
    }
    return true;
  }

  // 发布前校验校验
  checkSubmit = (isDraft) => {
    const { contentTextLength } = this.state;

    // 检查输入文本
    if (contentTextLength <= 0) {
      this.postToast(`最多输入${MAX_COUNT}字`);
      return false;
    }

    // 判断录音状态
    if (!this.checkAudioRecordStatus()) return false;

    if (!this.isHaveContent()) {
      this.postToast('请至少填写您要发布的内容或者上传图片、附件、视频、语音、投票等');
      return false;
    }
    if (!this.checkAttachPrice()) {
      this.postToast('请先上传附件、图片、视频或者语音');
      return false;
    }

    // 滑块验证
    const { webConfig } = this.props.site;
    if (webConfig) {
      const qcloudCaptcha = webConfig?.qcloud?.qcloudCaptcha;
      const qcloudCaptchaAppId = webConfig?.qcloud?.qcloudCaptchaAppId;
      const createThreadWithCaptcha = webConfig?.other?.createThreadWithCaptcha;
      if (qcloudCaptcha && createThreadWithCaptcha) {
        const { postData } = this.props.threadPost;
        const { captchaTicket, captchaRandStr } = postData;

        if (!captchaTicket || !captchaRandStr) {
          this.setState({
            isSavingDraft: isDraft
          });

          toTCaptcha(qcloudCaptchaAppId);
          return false;
        }
      }
    }

    return true;
  }

  // 提交发布内容
  handleSubmit = async (isDraft, isCaptchaCallback = false) => {
    if (!isCaptchaCallback) {
      if (!this.checkSubmit(isDraft)) return;
    }

    const { postData, setPostData, redpacketTotalAmount, isThreadPaid } = this.props.threadPost;
    const { rewardQa } = postData;

    // 支付流程
    // 如果是编辑的悬赏帖子，则不用再次支付
    const rewardAmount = isThreadPaid ? 0 : (Number(rewardQa.value) || 0);
    // 如果是编辑的红包帖子，则不用再次支付
    const redAmount = isThreadPaid ? 0 : (Number(redpacketTotalAmount) || 0);

    const amount = rewardAmount + redAmount;
    const options = { amount };
    if (!isDraft && amount > 0) {
      let type = ORDER_TRADE_TYPE.ORDER_TYPE_REDPACKET;
      let title = '支付红包';
      if (redAmount) {
        options.redAmount = redAmount;
      }
      if (rewardAmount) {
        type = ORDER_TRADE_TYPE.ORDER_TYPE_QUESTION_REWARD;
        title = '支付悬赏';
        options.rewardAmount = rewardAmount;
      }
      if (rewardAmount && redAmount) {
        type = ORDER_TRADE_TYPE.ORDER_TYPE_MERGE;
        title = '支付红包和悬赏';
      }

      // 等待支付
      PayBox.createPayBox({
        data: { ...options, title, type },
        currentPage: { type: 2 },
        orderCreated: async (orderInfo) => {
          const { orderSn } = orderInfo;
          setPostData({ orderInfo });
          if (orderSn) this.props.payBox.hide();
          this.createThread(true, true);
        },
        success: async () => {
          this.setIndexPageData();
          this.removeLocalData(); // 支付成功删除本地缓存
          if (this.state.threadId)
            Taro.redirectTo({ url: `/indexPages/thread/index?id=${this.state.threadId}` });
        },
      });
      return;
    }
    return this.createThread(isDraft);
  }

  async createThread(isDraft, isPay) {
    const { threadId } = this.state;
    const { threadPost } = this.props;
    const { setPostData } = threadPost;
    // 5 loading
    Taro.showLoading({
      title: isDraft && !isPay ? '保存草稿中...' : '发布中...',
      mask: true
    });
    // 6 根据是否存在主题id，选择更新主题、新建主题
    let ret = {};
    if (threadId) {
      ret = await threadPost.updateThread(threadId, true);
    } else {
      ret = await threadPost.createThread(true);
    }

    // 7 处理请求数据
    const { code, data, msg } = ret;
    if (code === 0) {
      if (!threadId) {
        this.setState({ threadId: data.threadId }); // 新帖首次保存草稿后，获取id
      }
      this.setState({ data });
      setPostData({ threadId: data.threadId });

      // 非草稿，跳转主题详情页
      Taro.hideLoading();

      // 未支付的订单
      if (isDraft && threadPost.postData.orderInfo.orderSn
        && !threadPost.postData.orderInfo.status
        && !threadPost.postData.draft) {
        this.props.payBox.show();
        return false;
      }

      if (!isDraft) {
        this.setIndexPageData();
        this.removeLocalData(); // 支付成功删除本地缓存
      }
      this.postToast('发布成功', 'success');

      if (!isDraft) {
        Taro.redirectTo({ url: `/indexPages/thread/index?id=${data.threadId}` });
      }

      return true;
    }
    Taro.hideLoading();
    (!isDraft || !isPay) && this.postToast(msg);
    return false;
  }

  setIndexPageData = () => {
    const { postType, threadId, data } = this.state;
    const { pid = '' } = data;

    // 再编辑发布成功，更新主题到首页
    if (postType === 'isEdit') {
      this.props.index.updateAssignThreadAllData(threadId, data);
      // 首次发布和草稿发布成功，首页如果是全部或者是当前分类且无需审核，则执行数据添加操作
    } else if (this.props.index.isNeedAddThread(pid) && data?.isApproved) {
      this.props.index.addThread(data);
    }
  };

  // 处理用户主动点击保存草稿
  handleSaveDraft = async (isCaptchaCallback = false) => {
    const { setPostData } = this.props.threadPost;
    setPostData({ draft: 1 });
    const isSuccess = await this.handleSubmit(true, isCaptchaCallback);
    console.log(`isSuccess`, isSuccess)
    if (isSuccess) {
      this.postToast('保存成功', 'success');
      setTimeout(() => {
        Taro.hideLoading();
        Taro.redirectTo({ url: `/indexPages/home/index` });
      }, 1000);
    } else if (isSuccess === false) {
      this.postToast('保存失败');
    }
  }

  // 首次发帖，文本框聚焦时，若标题为空，则此次永久隐藏标题输入
  toHideTitle = () => {
    const { postData } = this.props.threadPost;
    const { postType, isShowTitle } = this.state;
    if (
      postType === 'isFirst'
      && isShowTitle
      && postData.contentText !== ""
      && postData.title === ""
    ) {
      this.setState({ isShowTitle: false })
    }
  }

  // 点击空白区域自动聚焦文本框
  handleContentFocus = () => {
    if (this.contentRef && this.props.bottomHeight === 0) {
      this.contentRef.current.focus();
    }

    this.props.pageScrollTo();
  }

  checkAudioRecordStatus() {
    const { threadPost: { postData } } = this.props;
    const { audioRecordStatus } = postData;
    // 判断录音状态
    if (audioRecordStatus === 'began') {
      this.postToast('您有录制中的录音未处理，请先上传或撤销录音', 'none', 3000);
      return false;
    } if (audioRecordStatus === 'completed') {
      this.postToast('您有录制完成的录音未处理，请先上传或撤销录音', 'none', 3000);
      return false;
    }

    return true;
  }

  // 处理左上角按钮点击跳路由
  handlePageJump = async (canJump = false, url) => {
    const { postType } = this.state;

    if (!this.checkAudioRecordStatus()) return;

    // 判断是否可以保存草稿
    const { postData: { contentText, images, video, files, audio } } = this.props.threadPost;
    if (!canJump && postType !== 'isEdit' && (contentText || video.id || audio.id || Object.values(images).length || Object.values(files).length)) {
      this.setState({ showDraftOption: true });
      return;
    }

    url ? Taro.redirectTo({ url }) : Taro.navigateBack();
  }

  // scrollerIntoView() {
  //   const contentId = '#thread-post-content';
  //   const query = Taro.createSelectorQuery();
  //   query.select(contentId).boundingClientRect();
  //   query.selectViewport().scrollOffset()
  //   query.exec((res) => {
  //     const { bottom } = res[0] || {};
  //     const scrollTop = bottom + 200;
  //     Taro.pageScrollTo({
  //       scrollTop,
  //       selector: contentId,
  //       duration: 300,
  //       complete: (a, b, c) => {
  //         console.log(a,b,c)
  //       }
  //     });
  //   })
  // }

  render() {
    const { bottomHeight } = this.props;
    const { permissions } = this.props.user;
    // const { categories } = this.props.threadPost;
    const categories = this.props.threadPost?.getCurrentCategories();
    const { postData, setPostData, setCursorPosition, navInfo, cursorPosition } = this.props.threadPost;
    const { rewardQa, redpacket, video, product, position, contentText = '', title } = postData;
    const {
      postType,
      isShowTitle,
      maxLength,
      showClassifyPopup,
      operationType,
      showPaidOption,
      showEmoji,
      showDraftOption,
    } = this.state;
    const navStyle = {
      height: `${navInfo.navHeight}px`,
      paddingTop: `${navInfo.statusBarHeight}px`,
    }
    const containerStyle = {
      paddingTop: `${navInfo.statusBarHeight + navInfo.navHeight}px`
    }
    let defaultToolbarStyle = {}
    if (showEmoji || bottomHeight) defaultToolbarStyle = { paddingBottom: '0px', height: '45px' };
    const { site } = this.props;
    const { webConfig } = this.props.site || {};
    const { siteTitle } = webConfig.setSite.siteTitle;
    const headTitle = get(site, 'webConfig.setSite.siteName', '');
    return (
      <>
        <View className={styles.container} style={containerStyle} onClick={this.handleContentFocus}>
          {/* 自定义顶部导航条 */}
          <View className={styles.topBar} style={navStyle} onClick={e => e.stopPropagation()}>
            <Icon name="RightOutlined" onClick={() => this.handlePageJump(false)} />
            <View className={styles['topBar-title']}>
              <View className={styles['topBar-title-inner']}>{headTitle ? `发布 - ${headTitle}` : '发布'}</View>
            </View>
          </View>

          {/* 内容区域，inclue标题、帖子文字、图片、附件、语音等 */}
          <View className={styles.content}>
            <View id="thread-post-content">
            { site.webConfig.setSite.siteTitles === 1 && (
              <Title
                value={title}
                show={isShowTitle}
                onChange={this.onTitleChange}
                onFocus={() => {
                  this.setState({ showEmoji: false });
                }}
              />
            )}



              <Content
                ref={this.contentRef}
                value={postData.contentText}
                postType={postType}
                navInfo={navInfo}
                showEmoji={showEmoji}
                bottomHeight={bottomHeight}
                maxLength={maxLength}
                onChange={this.onContentChange}
                onFocus={() => {
                  this.setState({ showEmoji: false });
                }}
                onBlur={(e) => {
                  console.log('set', e.detail.cursor);
                  setCursorPosition(e.detail.cursor);
                }}
              />

              <View className={styles.plugin} onClick={e => e.stopPropagation()}>
                <GeneralUpload
                  type={operationType}
                  pageScrollTo={this.props.pageScrollTo}
                  audioUpload={(file) => { this.yundianboUpload('audio', file) }}
                >
                  <View id='thread-post-video'>
                    {video.thumbUrl && (
                      <Units
                        type='video'
                        deleteShow
                        src={video.thumbUrl}
                        onDelete={() => setPostData({ video: {} })}
                        onVideoLoaded={() => { }}
                      />
                    )}
                  </View>
                </GeneralUpload>

                {/* 投票组件 */}
                {(postData?.vote?.voteTitle) && (
                  <VoteWidget onDelete={() => setPostData({ vote: {} })} onClick={() => {
                    if (postData.vote.voteUsers > 0) {
                      return this.postToast('投票已生效，不允许编辑');
                    }
                    Taro.navigateTo({ url: '/indexPages/thread/voteEditor/index' });
                  }} />
                )}

                {/* {product.detailContent && <Units type='product' productSrc={product.imagePath} productDesc={product.title} productPrice={product.price} onDelete={() => setPostData({ product: {} })} />} */}
                <DZQPluginCenterInjection
                  target='plugin_post'
                  hookName='post_extension_content_hook'
                  pluginProps={{
                    renderData: postData.plugin,
                    deletePlugin: this.props.threadPost.deletePluginPostData,
                    updatePlugin: this.props.threadPost.setPluginPostData,
                    showPluginDialog: this.showPluginDialog,
                    closePluginDialog: this.closePluginDialog
                  }} />
              </View>

            </View>
          </View>

          {/* 工具栏区域、include各种插件触发图标、发布等 */}
          <View
            className={`${styles.toolbar} ${!bottomHeight && styles['toolbar-padding']}`}
            style={{ transform: `translateY(-${bottomHeight}px)`, bottom: bottomHeight ? 0 : '' }}
            onClick={e => e.stopPropagation()}
          >
            {/* 插入内容tag展示区 */}
            <View className={styles.tags} style={{ display: bottomHeight ? 'none' : 'block' }}>
              {this.props.threadPost.isHaveLocalData && (<View className={styles['post-localdata']}>
                <TagLocalData pid={this.inst.router.params.id} />
              </View>)}
              {(permissions?.insertPosition?.enable || postData.autoSaveTime) &&
                <View className={styles['location-bar']}>
                  {permissions?.insertPosition?.enable && (<Position
                    currentPosition={position}
                    positionChange={(position) => {
                      setPostData({ position });
                    }}
                    canJumpToChoose={() => this.checkAudioRecordStatus()}
                  />)}
                  {/* 自动保存提示 */}
                  {postData.autoSaveTime && (
                    <View className={styles['post-autosave']}>最近保存{postData.autoSaveTime}</View>
                  )}
                </View>
              }
              {(Boolean(postData.price || postData.attachmentPrice) || redpacket.price || rewardQa.value) && (
                <View className={styles['tag-toolbar']}>
                  {/* 插入付费tag */}
                  {(Boolean(postData.price || postData.attachmentPrice)) && (
                    <Units
                      type='tag'
                      style={{ marginTop: 0, paddingRight: '8px' }}
                      tagContent={`付费总额${(Number(postData.price) || Number(postData.attachmentPrice) || Number(0)).toFixed(2)}元`}
                      onTagClick={() => {
                        if (postData.price) {
                          this.handlePluginClick({ type: THREAD_TYPE.paidPost })
                        } else if (postData.attachmentPrice) {
                          this.handlePluginClick({ type: THREAD_TYPE.paidAttachment })
                        }
                      }}
                      onTagRemoveClick={() => {
                        setPostData({
                          price: 0,
                          attachmentPrice: 0
                        })
                      }}
                    />
                  )}
                  {/* 红包tag */}
                  {redpacket.price &&
                    <Units
                      type='tag'
                      style={{ marginTop: 0, paddingRight: '8px' }}
                      tagContent={this.redpacketContent()}
                      onTagClick={() => this.handlePluginClick({ type: THREAD_TYPE.redPacket })}
                      isCloseShow={this.state.canEditRedpacket}
                      onTagRemoveClick={() => { setPostData({ redpacket: {} }) }}
                    />
                  }
                  {/* 悬赏tag */}
                  {rewardQa.value &&
                    <Units
                      type='tag'
                      style={{ marginTop: 0, paddingRight: '8px' }}
                      tagContent={`悬赏金额${Number(rewardQa.value).toFixed(2)}元\\结束时间 ${rewardQa.times}`}
                      onTagClick={() => this.handlePluginClick({ type: THREAD_TYPE.reward })}
                      isCloseShow={this.state.canEditReward}
                      onTagRemoveClick={() => { setPostData({ rewardQa: {} }) }}
                    />
                  }
                </View>
              )}
            </View>

            {/* 工具栏 */}
            <PluginToolbar
              showPluginDialog={this.showPluginDialog}
              closePluginDialog={this.closePluginDialog}
              operationType={operationType}
              isOpenQcloudVod={this.props.site.isOpenQcloudVod}
              permissions={permissions}
              clickCb={(item) => {
                this.handlePluginClick(item);
              }}
              onCategoryClick={() => {
                this.setState({
                  showClassifyPopup: true,
                  showEmoji: false,
                  // operationType: 0
                });
              }}
              onSetplugShow={() => {
                showEmoji && this.setState({
                  showEmoji: false,
                  // operationType: 0
                });
              }}
            />
            <DefaultToolbar
              style={defaultToolbarStyle}
              operationType={operationType}
              permissions={permissions}
              onPluginClick={(item) => {
                this.handlePluginClick(item);
              }}
              onSubmit={() => this.handleSubmit(false, false)}
            />
            {/* 通过键盘改变的高度一起来控制表情的显示和隐藏，直接通过 showEmoji 来进行数据的改变，渲染慢 */}
            <Emoji
              show={bottomHeight === 0 && showEmoji}
              onHide={() => {
                this.setState({
                  showEmoji: false,
                  // operationType: 0
                });
              }}
              onClick={(emoji) => {
                setPostData({
                  contentText: contentText.slice(0, cursorPosition) + emoji.code + contentText.slice(cursorPosition)
                });
                setCursorPosition(cursorPosition + emoji.code.length);
              }}
            />
          </View>
        </View>

        {/* 二级分类弹框 */}
        <ClassifyPopup
          show={showClassifyPopup}
          category={categories}
          onHide={() => this.setState({ showClassifyPopup: false })}
        />
        {/* 主题付费选项弹框 */}
        <OptionPopup
          show={showPaidOption}
          list={paidOption}
          onClick={(item) => {
            if ((item.type === THREAD_TYPE.paidPost && postData.attachmentPrice) || (item.type === THREAD_TYPE.paidAttachment && postData.price)) {
              Toast.error({
                content: '全帖付费和部分付费不能同时设置',
              });
            } else {
              this.handlePluginClick(item);
            }
          }}
          onHide={() => this.setState({ showPaidOption: false })}
        />
        {/* 主题草稿选项弹框 */}
        <OptionPopup
          show={showDraftOption}
          list={draftOption}
          onClick={(item) => this.handlePluginClick(item)}
          onHide={() => this.setState({ showDraftOption: false })}
        />
        <Dialog
          visible={this.state.pluginDialogShow}
        >
          {this.state.pluginDialogContent}
        </Dialog>
      </>
    );
  }
}

export default Index;
