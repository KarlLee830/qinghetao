import React from 'react';
import { inject, observer } from 'mobx-react';
import Head from 'next/head';
import IndexH5Page from '@layout/thread/post/h5';
import IndexPCPage from '@layout/thread/post/pc';
import HOCTencentCaptcha from '@middleware/HOCTencentCaptcha';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCWithLogin from '@middleware/HOCWithLogin';
import * as localData from '@common/utils/thread-post-localdata';
import { Toast } from '@discuzqsdk/design';
import { THREAD_TYPE, MAX_COUNT, THREAD_STATUS } from '@common/constants/thread-post';
import Router from '@discuzqsdk/sdk/dist/router';
import PayBox from '@components/payBox/index';
import { ORDER_TRADE_TYPE } from '@common/constants/payBoxStoreConstants';
import { withRouter } from 'next/router';
import { tencentVodUpload } from '@common/utils/tencent-vod';
import { plus } from '@common/utils/calculate';
import { defaultOperation } from '@common/constants/const';
import ViewAdapter from '@components/view-adapter';
import commonUpload from '@common/utils/common-upload';
import { formatDate } from '@common/utils/format-date';
import typeofFn from '@common/utils/typeof';

@inject('site')
@inject('threadPost')
@inject('index')
@inject('thread')
@inject('user')
@inject('payBox')
@inject('vlist')
@inject('baselayout')
@inject('threadList')
@observer
class PostPage extends React.Component {
  toastInstance = null;

  constructor(props) {
    super(props);
    this.state = {
      postType: 'isFirst', // 发布状态 isFirst-首次，isEdit-再编辑，isDraft-草稿
      canEditRedpacket: true, // 可编辑红包
      canEditReward: true, // 可编辑悬赏
      emoji: {},
      // 分类选择显示状态
      categoryChooseShow: false,
      atList: [],
      topic: '',
      isVditorFocus: false,
      // 当前默认工具栏的操作 @common/constants/const defaultOperation
      currentDefaultOperation: '',
      // 当前附件工具栏的操作显示交互状态
      currentAttachOperation: false,
      // 解析完后显示商品信息
      productShow: false,
      // 语音贴上传成功的语音地址
      paySelectText: ['全帖付费', '部分付费'],
      curPaySelect: '',
      count: 0,
      draftShow: false,
      isTitleShow: true,
      jumpLink: '', // 退出页面时的跳转路径,默认返回上一页
      data: {}, // 创建帖子返回的数据
    };
    this.vditor = null;
    // 语音、视频、图片、附件是否上传完成。默认没有上传所以是上传完成的
    this.isAudioUploadDone = true;
    this.isVideoUploadDone = true;
    this.imageList = [];
    this.fileList = [];
    this.autoSaveInterval = null; // 自动保存计时器
  }

  componentDidMount() {
    this.props.threadPost.setThreadStatus(THREAD_STATUS.create);
    this.redirectToHome();
    this.props.router.events.on('routeChangeStart', this.handleRouteChange);
    this.fetchPermissions();
    const { fetchEmoji, emojis } = this.props.threadPost;
    if (emojis.length === 0) fetchEmoji();

    if (!this.isHaveContent()) {
      this.fetchDetail();
    }
  }

  componentWillUnmount() {
    this.captcha = '';
    if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
    this.props.router.events.off('routeChangeStart', this.handleRouteChange);
  }

  componentDidUpdate() {
    this.redirectToHome();
  }

  redirectToHome() {
    if (!this.props.user.threadExtendPermissions.createThread) {
      Toast.info({ content: '您没有发帖权限，即将回到首页' });
      const timer = setTimeout(() => {
        clearTimeout(timer);
        this.props.router.replace('/');
      }, 1000);
    }
  }

  handleRouteChange = (url) => {
    // 如果不是修改支付密码的页面则重置发帖信息
    if ((url || '').indexOf('/my/edit/paypwd') === -1
    && (url || '').indexOf('/pay/middle') === -1
    && (url || '').indexOf('/my/edit/find-paypwd') === -1
    && (url || '').indexOf('/plugin') === -1
    && (url || '').indexOf('/wallet') === -1) {
      if (this.vditor) this.vditor.setValue('');
      this.props.threadPost.resetPostData();
    }
  };

  saveDataLocal = () => {
    const { threadPost, user } = this.props;
    localData.setThreadPostDataLocal({ postData: threadPost.postData, userId: user.userInfo.id });
  };

  // 从本地缓存中获取数据
  getPostDataFromLocal = () => localData.getThreadPostDataLocal(this.props.user.userInfo.id, this.props.router.query.id);

  removeLocalData = () => {
    localData.removeThreadPostDataLocal();
  };

  fetchPermissions() {
    const { user } = this.props;
    if (!user.permissions) user.updateUserInfo();
  }

  postToast = (content) => {
    Toast.info({ content, duration: 2000, hasMask: true });
  };

  async fetchDetail() {
    const { thread, threadPost } = this.props;
    // 如果是编辑操作，需要获取链接中的帖子id，通过帖子id获取帖子详情信息
    const { query } = this.props.router;
    if (query && query.id) {
      const id = Number(query.id);
      let ret = {};
      if (id === (thread.threadData && thread.threadData.id) && thread.threadData) {
        ret.data = thread.threadData;
        ret.code = 0;
      } else ret = await thread.fetchThreadDetail(id);
      if (ret.code === 0) {
        // 设置主题状态、是否能操作红包和悬赏
        // const { postData, isThreadPaid } = this.props.threadPost;
        const { isDraft } = ret.data;
        // if (isThreadPaid) {
        //   Toast.info({ content: '已经支付的帖子不支持编辑', duration: 1000, hasMask: true });
        //   const timer = setTimeout(() => {
        //     clearTimeout(timer);
        //     this.props.router.replace(`/thread/${id}`);
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
        threadPost.formatThreadDetailToPostData(ret.data);
      } else {
        Toast.error({ content: ret.msg });
      }
    }
    if (this.getPostDataFromLocal()) this.props.threadPost.setLocalDataStatus(true);
    this.autoSaveData();
  }

  setPostData(data) {
    const { threadPost } = this.props;
    threadPost.setPostData(data);
  }

  // 处理录音完毕后的音频上传
  handleAudioUpload = async (blob) => {
    // 开始语音的上传
    this.isAudioUploadDone = false;
    blob.name = `${new Date().getTime()}.mp3`;
    tencentVodUpload({
      file: blob,
      onUploading: () => {
        this.toastInstance = Toast.loading({
          content: '上传中...',
          duration: 0,
        });
      },
      onComplete: (res, file) => {
        this.handleVodUploadComplete(res, file, THREAD_TYPE.voice);
      },
      onError: (err) => {
        this.handleVodUploadComplete(null, blob, THREAD_TYPE.voice);
        Toast.error({ content: err.message });
      },
    });
  };

  // 上传视频之前判断是否已经有了视频，如果有了视频提示只能上传一个视频
  // 这个和选择文件之前的回调放到一起了，所以注意一下
  handleVideoUpload = (files) => {
    const { postData } = this.props.threadPost;
    const { qcloudVodExt, qcloudVodSize} = this.props.site;
    if ((postData.video && postData.video.id) || (postData.iframe && postData.iframe.content)) {
      Toast.info({ content: '只能上传一个视频' });
      return false;
    }
    if (!files) return true;

    const [file] = files;
    const isVideoType = this.checkFileType(file, qcloudVodExt);
    if (qcloudVodExt && !isVideoType) {
      Toast.info({ content: `仅支持${qcloudVodExt}类型的视频` });
      return false;
    }
    if (qcloudVodSize && qcloudVodSize * 1024 * 1024 < file.size) {
      Toast.info({ content: `大小在0到${qcloudVodSize}MB之间` });
      return false;
    }
    let toastInstance = null;
    toastInstance = Toast.loading({
      content: '上传中...',
      duration: 0,
      hasMask: true,
    });
    tencentVodUpload({
      file,
      onUploading: () => {},
      onComplete: (res, file) => {
        this.handleVodUploadComplete(res, file, THREAD_TYPE.video);
        toastInstance?.destroy();
      },
      onError: (err) => {
        this.handleVodUploadComplete(null, file, THREAD_TYPE.video);
        Toast.error({ content: err.message });
        toastInstance?.destroy();
      },
    });
  };

  // 通过云点播上传成功之后处理：主要是针对语音和视频
  handleVodUploadComplete = async (ret, file, type) => {
    if (!ret) {
      this.isVideoUploadDone = true;
      this.isAudioUploadDone = true;
      return;
    }
    const { fileId, video } = ret;
    const params = {
      fileId,
      mediaUrl: video.url,
    };
    if (type === THREAD_TYPE.voice) params.type = 1;
    const result = await this.props.threadPost.createThreadVideoAudio(params);
    this.toastInstance?.destroy();
    const { code, data } = result;
    if (code === 0) {
      if (type === THREAD_TYPE.video) {
        this.setPostData({
          video: {
            id: data?.id,
            thumbUrl: data.mediaUrl,
            type: file.type,
          },
        });
        this.isVideoUploadDone = true;
        this.scrollIntoView('#dzq-post-video');
      } else if (type === THREAD_TYPE.voice) {
        // 语音上传并保存完成
        this.setPostData({
          audio: {
            id: data?.id,
            mediaUrl: data.mediaUrl,
            type: file.type,
          },
          audioSrc: data.mediaUrl,
          audioRecordStatus: 'uploaded',
        });
        this.isAudioUploadDone = true;
      }
    } else {
      this.isVideoUploadDone = true;
      this.isAudioUploadDone = true;
      Toast.error({ content: result.msg });
    }
  };

  // 表情
  handleEmojiClick = (emoji) => {
    this.setState({ emoji });
  };

  // 附件相关icon
  /**
   * 点击附件相关icon
   * @param {object} item 附件相关icon
   * @param {object} data 要设置的数据
   */
  handleAttachClick = (item, data) => {
    this.setState({ currentDefaultOperation: '' });
    if (!this.checkAudioRecordStatus()) return;

    const { isPc } = this.props.site;
    if (!isPc && item.type === THREAD_TYPE.voice) {
      const u = navigator.userAgent.toLocaleLowerCase();

      // iphone设备降级流程
      if (u.indexOf('iphone') > -1) {
        // 判断是否在微信内
        if (u.indexOf('micromessenger') > -1) {
          Toast.info({ content: 'iOS版微信暂不支持录音功能' });
          return;
        }

        // 判断ios版本号
        const v = u.match(/cpu iphone os (.*?) like mac os/);
        if (v) {
          const version = v[1].replace(/_/g, '.').split('.')
            .splice(0, 2)
            .join('.');
          if (
            Number(version) < 14.3
            && !(u.indexOf('safari') > -1 && u.indexOf('chrome') < 0 && u.indexOf('qqbrowser') < 0 && u.indexOf('360') < 0)
          ) {
            Toast.info({ content: 'iOS版本太低，请升级至iOS 14.3及以上版本或使用Safari浏览器访问' });
            return;
          }
        }
      }

      // uc浏览器降级流程
      if (u.indexOf('ucbrowser') > -1) {
        Toast.info({ content: '此浏览器暂不支持录音功能' });
        return;
      }
      // this.setState({ curPaySelect: THREAD_TYPE.voice })
    }

    const { postData } = this.props.threadPost;

    if (item.type === THREAD_TYPE.reward && !this.state.canEditReward) {
      Toast.info({ content: '悬赏内容不可编辑' });
      return false;
    }

    if (item.type === THREAD_TYPE.vote && postData?.vote?.voteUsers > 0) {
      Toast.info({ content: '投票已生效，不允许编辑' });
      return false;
    }

    if (item.type === THREAD_TYPE.video) {
      // 本地上传的视频和网络插入的iframe是互斥的关系
      if ((postData.video && postData.video.id) || (postData.iframe && postData.iframe.content)) {
        Toast.info({ content: '只能上传一个视频' });
        return false;
      }
    }

    if (item.type === THREAD_TYPE.anonymity) {
      if (postData.anonymous) this.setPostData({ anonymous: 0 });
      else this.setPostData({ anonymous: 1 });
    }

    if (data) {
      this.setPostData(data);
      return false;
    }
    this.props.threadPost.setCurrentSelectedToolbar(item.type);
    this.setState({ currentAttachOperation: item.type }, () => {
      if (item.type === THREAD_TYPE.image) {
        this.scrollIntoView('.dzq-post-image-upload');
      }
      if (item.type === THREAD_TYPE.voice) {
        this.scrollIntoView('#dzq-post-audio-record');
      }
    });
  };

  // 滚动到可视区
  scrollIntoView = (id) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      let rect = {};
      const elem = document.querySelector(id);
      if (elem) rect = elem.getBoundingClientRect();
      const top = rect.y || 0;
      this.handleEditorBoxScroller(top);
    }, 0);
  };

  // 表情等icon
  handleDefaultIconClick = (item, child, data) => {
    if (!this.checkAudioRecordStatus()) return;

    const { postData } = this.props.threadPost;

    if (item.type === THREAD_TYPE.redPacket && !this.state.canEditRedpacket) {
      this.setState({ currentDefaultOperation: item.id }, () => {
        this.setState({ currentDefaultOperation: '' });
        this.postToast('红包内容不能编辑');
      });
      return false;
    }

    if (data) {
      this.setPostData(data);
      return false;
    }
    if (child && child.id) {
      const content = '全帖付费和部分付费不能同时设置';
      if (postData.price && child.id === '部分付费') {
        this.postToast(content);
        return false;
      }
      if (postData.attachmentPrice && child.id === '全帖付费') {
        Toast.error({ content });
        return false;
      }
      this.setState({ currentDefaultOperation: item.id, curPaySelect: child.id, emoji: {} });
    } else {
      this.setState({ currentDefaultOperation: item.id, emoji: {} }, () => {
        if (item.id === defaultOperation.attach) {
          this.scrollIntoView('.dzq-post-file-upload');
        }
      });
    }
  };

  checkFileType = (file, supportType) => {
    const { name, imageType } = file;
    let prefix = imageType;
    if (!imageType) {
      const arr = (name || '')?.toLowerCase()?.split('.');
      prefix = arr[arr.length - 1];
    }
    if (supportType.indexOf(prefix) === -1) return false;
    return true;
  };

  // 附件、图片上传之前
  beforeUpload = (cloneList, showFileList, type) => {
    const { webConfig, attachmentLimit } = this.props.site;
    if (!webConfig) return false;
    // 站点支持的文件类型、文件大小
    const { supportFileExt, supportImgExt, supportMaxSize } = webConfig.setAttach;
    const { qcloudCos } = webConfig.qcloud;

    let photoMaxSize = supportMaxSize;
    if (type === THREAD_TYPE.image && qcloudCos) {
      photoMaxSize = supportMaxSize > 15 ? 15 : supportMaxSize;
    }

    const limit = type === THREAD_TYPE.image ? 9 : attachmentLimit; // 上传限制数量
    const remainLength = limit - showFileList.length; // 剩余可传数量
    cloneList.splice(remainLength, cloneList.length - remainLength);

    let isAllLegalType = true; // 状态：此次上传图片是否全部合法
    let isAllLegalSize = true;
    for (let i = 0; i < cloneList.length; i++) {
      const imageSize = cloneList[i].size;
      const isLegalType =        type === THREAD_TYPE.image
        ? this.checkFileType(cloneList[i], supportImgExt)
        : this.checkFileType(cloneList[i], supportFileExt);
      const isLegalSize = imageSize > 0 && imageSize < photoMaxSize * 1024 * 1024;

      // 存在不合法图片时，从上传图片列表删除
      if (!isLegalType || !isLegalSize) {
        cloneList.splice(i, 1);
        i = i - 1;
        if (!isLegalType) isAllLegalType = false;
        if (!isLegalSize) isAllLegalSize = false;
      }
    }
    const supportExt = type === THREAD_TYPE.image ? supportImgExt : supportFileExt;
    const name = type === THREAD_TYPE.file ? '附件' : '图片';
    !isAllLegalType && Toast.info({ content: `仅支持${supportExt}类型的${name}` });
    !isAllLegalSize && Toast.info({ content: `大小在0到${photoMaxSize}MB之间` });
    if (type === THREAD_TYPE.file) this.fileList = [...cloneList];
    if (type === THREAD_TYPE.image) this.imageList = [...cloneList];

    return true;
  };

  // 附件和图片上传
  handleUploadChange = (fileList, type) => {
    const { postData } = this.props.threadPost;
    const { images, files } = postData;
    const changeData = {};
    (fileList || []).map((item) => {
      let tmp = images[item.id] || images[item.uid];
      if (type === THREAD_TYPE.file) tmp = files[item.id] || files[item.uid];
      if (tmp) {
        if (item.id) changeData[item.id] = tmp;
        else changeData[item.uid] = tmp;
      } else {
        changeData[item.uid] = item;
      }
      return item;
    });
    if (type === THREAD_TYPE.image) this.setPostData({ images: changeData });
    if (type === THREAD_TYPE.file) this.setPostData({ files: changeData });
  };

  // 附件和图片上传完成之后的处理
  handleUploadComplete = (ret, file, type) => {
    this.imageList = this.imageList.filter(item => item.uid !== file.uid);
    this.fileList = this.fileList.filter(item => item.uid !== file.uid);
    if (ret.code !== 0) {
      const msg = ret.code === 413 ? '上传大小超过了服务器限制' : ret.msg;
      Toast.error({ content: `上传失败：${msg}` });
      return false;
    }
    const { uid } = file;
    const { data } = ret;
    const { postData } = this.props.threadPost;
    const { images, files } = postData;
    if (type === THREAD_TYPE.image) {
      images[uid] = data;
    }
    if (type === THREAD_TYPE.file) {
      files[uid] = data;
    }
    this.setPostData({ images, files });
  };

  // 视频准备上传
  onVideoReady = (player) => {
    const { postData } = this.props.threadPost;
    // 兼容本地视频的显示
    const opt = {
      src: postData.video.thumbUrl,
      type: postData.video.type,
    };
    player && player.src(opt);
  };

  // 编辑器
  handleVditorChange = (vditor, event) => {
    if (vditor) {
      this.vditor = vditor;
      const htmlString = vditor.getHTML();
      this.setPostData({ contentText: htmlString, isResetContentText: false });
      if (!this.props.threadPost.postData.title) {
        if (!this.state.isTitleShow || this.props.site.platform === 'pc' || !event) return;
        this.setState({ isTitleShow: false });
      }
    }
  };

  handleVditorInit = (vditor) => {
    if (vditor) this.vditor = vditor;
  };

  handleVditorFocus = () => {
    if (this.vditor) this.vditor.focus();
  };

  // 关注列表
  handleAtListChange = (atList) => {
    this.setState({ atList });
  };

  checkAttachPrice = () => {
    const { postData } = this.props.threadPost;
    // 附件付费设置了需要判断是否进行了附件的上传
    if (postData.attachmentPrice) {
      if (
        !(
          postData.audio.id
          || postData.video.id
          || Object.keys(postData.images)?.length
          || Object.keys(postData.files)?.length
        )
      ) return false;
      return true;
    }
    return true;
  };

  checkAudioRecordStatus() {
    const {
      threadPost: { postData },
    } = this.props;
    const { audioRecordStatus } = postData;
    // 判断录音状态
    if (audioRecordStatus === 'began') {
      Toast.info({ content: '您有录制中的录音未处理，请先上传或撤销录音', duration: 3000 });
      return false;
    }
    if (audioRecordStatus === 'completed') {
      Toast.info({ content: '您有录制完成的录音未处理，请先上传或撤销录音', duration: 3000 });
      return false;
    }

    return true;
  }

  // 是否有内容
  isHaveContent() {
    const { postData } = this.props.threadPost;
    const { images, video, files, audio, vote, iframe = {}, plugin } = postData;
    // todo, 应该还需要扩展当前插件是否可以无需文字
    if (!(postData.contentText || video.id || vote.voteTitle || audio.id || !typeofFn.isEmptyObject(plugin)
      || Object.values(images).length
      || Object.values(files).length
      || iframe.content)) {
      return false;
    }
    return true;
  }

  // 发布提交
  handleSubmit = async (isDraft) => {
    if (!isDraft) this.setPostData({ draft: 0 });
    if (this.state.count >= MAX_COUNT) {
      this.postToast(`不能超过${MAX_COUNT}字`);
      return;
    }
    if (!this.props.user.threadExtendPermissions.createThread) {
      Toast.info({ content: '您没有发帖权限' });
      this.postToast('您没有发帖权限');
      return;
    }
    if (!this.isAudioUploadDone) {
      this.postToast('请等待语音上传完成再发布');
      return;
    }
    if (!this.isVideoUploadDone) {
      this.postToast('请等待视频上传完成再发布');
      return;
    }
    if (this.imageList.length > 0) {
      this.postToast('请等待图片上传完成再发布');
      return;
    }
    if (this.fileList.length > 0) {
      this.postToast('请等待文件上传完成再发布');
      return;
    }

    if (!this.checkAudioRecordStatus()) return;

    if (!this.isHaveContent()) {
      this.postToast('请至少填写您要发布的内容或者上传图片、附件、视频、语音、投票等');
      return;
    }
    if (!this.checkAttachPrice()) {
      this.postToast('请先上传附件、图片、视频或者语音');
      return;
    }
    // if (!isDraft && this.state.count > MAX_COUNT) {
    //   Toast.info({ content: `输入的内容不能超过${MAX_COUNT}字` });
    //   return;
    // }

    // 在提交之前也保存一下本地数据
    this.saveDataLocal();
    const { threadPost } = this.props;

    // 2 验证码
    const { webConfig } = this.props.site;
    if (webConfig) {
      const qcloudCaptcha = webConfig?.qcloud?.qcloudCaptcha;
      const createThreadWithCaptcha = webConfig?.other?.createThreadWithCaptcha;
      // 开启了腾讯云验证码验证时，进行验证，通过后再进行实际的发布请求

      if (qcloudCaptcha && createThreadWithCaptcha) {
        // 验证码票据，验证码字符串不全时，弹出滑块验证码
        const { captchaTicket, captchaRandStr } = await this.props.showCaptcha();
        if (!captchaTicket && !captchaRandStr) return false;
        threadPost.setPostData({captchaTicket, captchaRandStr});
      }
    }

    // 支付流程
    const { rewardQa } = threadPost.postData;
    const { redpacketTotalAmount } = threadPost;
    // 如果是编辑的悬赏帖子，则不用再次支付
    const rewardAmount = threadPost.isThreadPaid ? 0 : plus(rewardQa.value, 0);
    // 如果是编辑的红包帖子，则不用再次支付
    const redAmount = threadPost.isThreadPaid ? 0 : plus(redpacketTotalAmount, 0);
    const amount = plus(rewardAmount, redAmount);
    const data = { amount };
    // 保存草稿操作不执行支付流程
    if (!isDraft && amount > 0) {
      let type = ORDER_TRADE_TYPE.ORDER_TYPE_REDPACKET;
      let title = '支付红包';
      if (redAmount > 0) {
        data.redAmount = redAmount;
      }
      if (rewardAmount > 0) {
        type = ORDER_TRADE_TYPE.ORDER_TYPE_QUESTION_REWARD;
        title = '支付悬赏';
        data.rewardAmount = rewardAmount;
      }
      if (rewardAmount > 0 && redAmount > 0) {
        type = ORDER_TRADE_TYPE.ORDER_TYPE_MERGE;
        title = '支付红包和悬赏';
      }
      PayBox.createPayBox({
        data: { ...data, title, type },
        currentPage: { type: 2 },
        orderCreated: async (orderInfo) => {
          const { orderSn } = orderInfo;
          this.setPostData({ orderInfo });
          if (orderSn) this.props.payBox.hide();
          this.createThread(true, false, true);
        },
        success: async () => {
          this.setIndexPageData();
          this.removeLocalData(); // 支付成功删除本地缓存
          const { threadId } = this.props.threadPost.postData;
          if (threadId) this.props.router.replace(`/thread/${threadId}`);
        }, // 支付成功回调
      });
      return;
    }
    this.createThread(isDraft);
    return false;
  };

  // 自动保存
  autoSaveData() {
    if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
    this.autoSaveInterval = setInterval(() => {
      // 7.28 已发布的帖子也可以保存草稿
      if (this.isHaveContent()) {
        // this.setPostData({ draft: 1 });
        this.saveDataLocal();
        // this.createThread(true, true);
        const now = formatDate(new Date(), 'hh:mm');
        this.setPostData({ autoSaveTime: now });
      }
    }, 30000);
  }

  async createThread(isDraft, isAutoSave = false, isPay = false) {
    const { threadPost, thread, site, threadList } = this.props;

    // 图文混排：第三方图片转存
    const { webConfig: { setAttach, qcloud } } = site;
    const { supportImgExt, supportMaxSize } = setAttach;
    const { qcloudCosBucketName, qcloudCosBucketArea, qcloudCosSignUrl, qcloudCos } = qcloud;


    const errorTips = '部分图片转存失败，请替换标注红框的图片';
    const vditorEl = document.getElementById('dzq-vditor');
    if (vditorEl) {
      const errorImg = vditorEl.querySelectorAll('.editor-upload-error');
      if (errorImg.length) {
        this.jumpToErrorImgElement(errorImg[0]);
        Toast.error({
          content: errorTips,
          hasMask: true,
          duration: 3000,
        });
        return;
      }
    }

    let { contentText } = threadPost.postData;
    const images = contentText.match(/<img.*?\/>/g)?.filter(image => (!image.match('alt="attachmentId-') && !image.includes('emoji')));
    if (images && images.length) {
      const fileurls = images.map((img) => {
        const src = img.match(/\"(.*?)\"/);
        if (src) return src[1];
        return false;
      });

      const toastInstance = Toast.loading({
        content: '图片转存中...',
        hasMask: true,
        duration: 0,
      });
      const res = await commonUpload({
        files: fileurls,
        type: 1,
        supportImgExt,
        supportMaxSize,
        qcloudCosBucketName,
        qcloudCosBucketArea,
        qcloudCosSignUrl,
        qcloudCos,
      });
      const sensitiveArr = [];
      const uploadError = [];
      res.forEach((ret, index) => {
        const { code, data = {} } = ret;
        if (code === 0) {
          const { url, id } = data;
          contentText = contentText.replace(images[index], `<img src=\"${url}\" alt=\"attachmentId-${id}\" />`);
        } else if (code === -7075) {
          sensitiveArr.push('');
          contentText = contentText.replace(images[index], images[index].replace('alt=\"\"', 'alt=\"uploadError\"'));
        } else {
          uploadError.push('');
          contentText = contentText.replace(images[index], images[index].replace('alt=\"\"', 'alt=\"uploadError\"'));
        }
      });
      threadPost.setPostData({ contentText });
      this.vditor.setValue(this.vditor.html2md(contentText));
      toastInstance.destroy();

      const uploadErrorImages = document.querySelectorAll('img[alt=uploadError]');
      for (let i = 0; i < uploadErrorImages.length; i++) {
        const element = uploadErrorImages[i];
        // 如果是第一个，则滚动至此
        if (i === 0) {
          this.jumpToErrorImgElement(element);
        }

        element.setAttribute('class', 'editor-upload-error');
      }

      if (sensitiveArr.length) {
        Toast.error({
          content: '帖子内容中含有敏感图片，请先处理相关图片再重新发布',
          hasMask: true,
          duration: 4000,
        });
        return;
      }

      if (uploadError.length) {
        Toast.error({
          content: '部分图片转存失败，请替换标注红框的图片',
          hasMask: true,
          duration: 4000,
        });
        return;
      }
    }

    // 提交帖子数据
    let ret = {};
    if (!(isAutoSave || isPay)) this.toastInstance = Toast.loading({ content: isDraft ? '保存草稿中' : '发布中...', hasMask: true });
    if (threadPost.postData.threadId) ret = await threadPost.updateThread(threadPost.postData.threadId);
    else ret = await threadPost.createThread();
    const { code, data, msg } = ret;
    if (code === 0) {
      this.setState({ data });
      thread.reset({});
      this.toastInstance && this.toastInstance?.destroy();
      this.setPostData({ threadId: data.threadId });

      // 编辑帖子，帖子含敏感字段就操作删除
      if (threadPost.postData.threadId && !data.isApproved) {
        threadList.deleteListItem({ item: data });
      }
      // 防止被清除

      // 未支付的订单
      if (isDraft && !isAutoSave
        && threadPost.postData.orderInfo.orderSn
        && !threadPost.postData.orderInfo.status
        && !threadPost.postData.draft
      ) {
        this.props.payBox.show();
        return;
      }

      if (!isDraft) {
        this.setIndexPageData();
        this.removeLocalData(); // 非草稿删除本地缓存
        this.props.router.replace(`/thread/${data.threadId}`);
      } else {
        const { jumpLink } = this.state;
        !isAutoSave && Toast.info({ content: '保存草稿成功' });
        // 移动端非自动保存
        if (!this.props.site.isPC && !isAutoSave) {
          jumpLink ? Router.push({ url: jumpLink }) : Router.back();
        }
      }
      return true;
    }
    this.saveDataLocal();
    Toast.error({ content: msg });
  }

  /**
   * 跳转到第一个上传错误图片
   * @param {*} element
   */
  jumpToErrorImgElement = (element) => {
    const { top }  = element.getBoundingClientRect();

    const isPc = this.props.site?.platform === 'pc';
    const editorbox = document.querySelector('#post-inner');
    const currentScrollTop = editorbox.scrollTop;

    const { height: boxHeight } = editorbox.getBoundingClientRect();

    if (isPc) {
      editorbox.scrollTo({
        top: currentScrollTop + top,
        behavior: 'smooth',
      });
    } else {
      editorbox.scrollTo({
        top: currentScrollTop + top - (0.5 * boxHeight),
        behavior: 'smooth',
      });
    }
  }

  setIndexPageData = () => {
    const { data } = this.state;
    const { postData } = this.props.threadPost;
    const { query } = this.props.router;
    // 更新帖子到首页列表
    if (query && query.id) {
      this.props.index.updateAssignThreadAllData(postData.threadId, data);
      // 添加帖子到首页数据
    } else {
      const { pid = '' } = data;
      // 首页如果是全部或者是当前分类，则执行数据添加操作
      if (this.props.index.isNeedAddThread(pid) && data?.isApproved) {
        this.props.vlist.resetPosition();
        this.props.baselayout.setJumpingToTop();
        this.props.index.addThread(data);
        this.props.index.getReadCategories(); // 发帖后分类数据更新
        this.props.site.getSiteInfo(); // 发帖后分类中"全部"数据更新
      }
    }
  };

  // 保存草稿
  handleDraft = (val) => {
    const { site: { isPC } } = this.props;
    if (isPC) {
      this.setPostData({ draft: 1 });
      this.handleSubmit(true);
      return;
    }

    this.setState({ draftShow: false });
    if (val === '保存草稿') {
      this.setPostData({ draft: 1 });
      this.handleSubmit(true);
    }
    if (val === '不保存草稿') {
      const { jumpLink } = this.state;
      jumpLink ? Router.push({ url: jumpLink }) : Router.back();
    }
  }

  handleEditorBoxScroller = (top = 0) => {
    const editorbox = document.querySelector('#post-inner');
    const editorContent = document.querySelector('#dzq-vditor');
    const rect = editorbox.getBoundingClientRect();
    if (top < editorContent.clientHeight) top = editorContent.clientHeight;
    const gap = this.props.site?.isPc ? rect.top - top : top;
    editorbox.scrollTo({ top: gap, behavior: 'smooth' });
  };

  render() {
    // const { isPC } = this.props.site;

    const pc = (
      <IndexPCPage
        setPostData={data => this.setPostData(data)}
        handleAttachClick={this.handleAttachClick}
        handleDefaultIconClick={this.handleDefaultIconClick}
        handleVideoUpload={this.handleVideoUpload}
        handleVideoUploadComplete={this.handleVodUploadComplete}
        beforeUpload={this.beforeUpload}
        handleUploadChange={this.handleUploadChange}
        handleUploadComplete={this.handleUploadComplete}
        handleAudioUpload={this.handleAudioUpload}
        handleEmojiClick={this.handleEmojiClick}
        handleSetState={data => this.setState({ ...data })}
        handleSubmit={this.handleSubmit}
        saveDataLocal={this.saveDataLocal}
        handleAtListChange={this.handleAtListChange}
        handleVditorChange={this.handleVditorChange}
        handleVditorFocus={this.handleVditorFocus}
        handleVditorInit={this.handleVditorInit}
        onVideoReady={this.onVideoReady}
        handleDraft={this.handleDraft}
        {...this.state}
      />
    );
    const h5 = (
      <IndexH5Page
        setPostData={data => this.setPostData(data)}
        handleAttachClick={this.handleAttachClick}
        handleDefaultIconClick={this.handleDefaultIconClick}
        handleVideoUpload={this.handleVideoUpload}
        handleVideoUploadComplete={this.handleVodUploadComplete}
        beforeUpload={this.beforeUpload}
        handleUploadChange={this.handleUploadChange}
        handleUploadComplete={this.handleUploadComplete}
        handleAudioUpload={this.handleAudioUpload}
        handleEmojiClick={this.handleEmojiClick}
        handleSetState={data => this.setState({ ...data })}
        handleSubmit={this.handleSubmit}
        saveDataLocal={this.saveDataLocal}
        handleAtListChange={this.handleAtListChange}
        handleVditorChange={this.handleVditorChange}
        handleVditorFocus={this.handleVditorFocus}
        handleVditorInit={this.handleVditorInit}
        onVideoReady={this.onVideoReady}
        handleDraft={this.handleDraft}
        handleEditorBoxScroller={this.handleEditorBoxScroller}
        checkAudioRecordStatus={this.checkAudioRecordStatus.bind(this)}
        {...this.state}
      />
    );

    return (
      <>
        <Head>
          {/* 编辑器markdown依赖 */}
		  {/*<script key="lute" async src="https://dl.discuz.chat/discuzq-fe/static/lute/lute.min.js" />*/}
          <script key="lute" async src="/js/lute.min.js" />
        </Head>
        <ViewAdapter h5={h5} pc={pc} title="发布" />
      </>
    );
  }
}

// eslint-disable-next-line new-cap
export default HOCTencentCaptcha(HOCFetchSiteData(HOCWithLogin(withRouter(PostPage))));
