import React from 'react';
import Taro, { getCurrentInstance } from '@tarojs/taro';
import Router from '@discuzqsdk/sdk/dist/router';
import Page from '@components/page';
import { inject } from 'mobx-react';
import ThreadMiniPage from '@layout/thread/index';
// import PayBoxProvider from '@components/payBox/payBoxProvider';
import withShare from '@common/utils/withShare/withShare';
import { priceShare } from '@common/utils/priceShare';
import { updateViewCountInStorage } from '@common/utils/viewcount-in-storage';
import Toast from '@components/toast';
import ShareError from '@components/share-error/index';
import ErrorMiniPage from '../../layout/error/index';
import { updateThreadAssignInfoInLists } from '@common/store/thread-list/list-business';

// const MemoToastProvider = React.memo(ToastProvider);
@inject('site')
@inject('thread')
@inject('user')
@inject('commentPosition')
@inject('index')
@inject('threadList')
@inject('baselayout')
@withShare({
  showShareTimeline: true
})
class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isServerError: false,
      serverErrorType: 'error',
      serverErrorMsg: '',
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.router?.query?.id && this.props.router.query.id !== prevProps.router.query.id) {
      this.props.thread.reset();
      this.getPageDate(this.props.router.query.id);
    }
  }

  componentDidHide() {
    const { baselayout } = this.props;

    const playingAudioDom = baselayout?.playingAudioDom;

    if (playingAudioDom) {
      baselayout.playingAudioDom.pause();
      baselayout.playingAudioDom = null;
    }
  }

  // 页面分享
  getShareData(data) {
    const { threadId, isAnonymous } = this.props.thread.threadData;
    const { isPrice } = this.props.thread.threadData.displayTag;
    const defalutTitle = this.props.thread.title;
    const path = `/indexPages/thread/index?id=${threadId}`;
    if (data.from === 'timeLine') {

      const {content} = this.props?.thread?.threadData;
      const imageUrl = ( content?.indexes[101] )? content?.indexes[101].body[0]?.url : this.props?.user?.userInfo?.avatarUrl ;
      return {
        title: defalutTitle,
        query: `id=${threadId}`,
        imageUrl,
      };
    }
    if (data.from === 'menu') {
      const isApproved = this.props?.thread?.threadData?.isApproved === 1;
      const { thread, user } = this.props
      const {nickname} = thread.threadData?.user || ''
      const {avatar} = thread.threadData?.user || ''
      // 处理匿名情况
      if(thread.threadData?.isAnonymous) {
        user.getShareData({nickname, avatar,threadId})
        thread.threadData.user.nickname = '匿名用户'
        thread.threadData.user.avatar = ''
      }
      // 这里要用一个定时器，防止出现灰色遮罩层
      if(!isApproved) {
        Toast.info({content: '内容正在审核中'})
        const promise = new Promise((resolve, reject) => {
          setTimeout(() => {
            reject();
          }, 1000);
        });
        return { promise };
      }
      return (
        priceShare({ isAnonymous, isPrice, path }) || {
          title: defalutTitle,
          path,
        }
      );
    }
    this.props.thread.shareThread(threadId);

    return (
      priceShare({ isAnonymous, isPrice, path }) || {
        title: defalutTitle,
        path,
      }
    );
  }

  updateViewCount = async (id) => {
    const { site } = this.props;
    const { openViewCount } = site?.webConfig?.setSite || {};
    const viewCountMode = Number(openViewCount);

    const threadId = Number(id);
    const viewCount = await updateViewCountInStorage(threadId, viewCountMode === 0);
    if (viewCount) {
      this.props.thread.updateViewCount(viewCount);
      updateThreadAssignInfoInLists(threadId, {
        updateType: 'viewCount',
        updatedInfo: { viewCount },
      });
    }
  };

  async componentDidShow() {

    const { id, postId } = getCurrentInstance().router.params;

    // 判断缓存
    // const oldId = this.props?.thread?.threadData?.threadId;
    // if (Number(id) === oldId && id && oldId) {
    //   return;
    // }
    // this.props.thread.reset();

    if (id) {
      await this.getPageDate(id, postId);
      this.updateViewCount(id);
    }
  }

  // 尝试从列表中获取帖子数据
  async getThreadDataFromList(id) {
    if (id) {
      let threadData;

      let listType = '';
      const targetThreadList = this.props.threadList.findAssignThreadInLists({ threadId: Number(id) });
      if (targetThreadList?.length) {
        targetThreadList.forEach((targetThread) => {
          if (!threadData && targetThread.data) {
            listType = targetThread.listName;
            threadData = targetThread.data;
          }
        });
      }

      if (threadData?.threadId && !threadData?.displayTag?.isRedPack && !threadData?.displayTag?.isReward) {
        this.props.thread.setThreadData(threadData);
        this.props.thread.setPageDataListType(listType); // 记录使用的是哪个列表数据
      }
    }
  }

  async getPageDate(id, postId) {
    // 如果存在缓存且和路由id不同,先清除缓存
    this.canUseCache();
    // 先尝试从列表store中获取帖子数据
    this.getThreadDataFromList(id);

    if (!this.props?.thread?.threadData) {
      const res = await this.props.thread.fetchThreadDetail(id);

      if (res.code !== 0) {
        // 404
        if (res.code === -4004) {
          Router.replace({ url: '/subPages/404/index' });
          return;
        }

        if (res.code > -5000 && res.code < -4000) {
          this.setState({
            serverErrorMsg: res.msg,
          });
        }

        if (res.code === -3001) {
          this.setState({
            serverErrorType: 'permission',
          });
        }

        if (res.code === -3006) {
          this.setState({
            serverErrorType: 'pay',
          });
        }

        this.setState({
          isServerError: true,
        });
        return;
      }
    }

    // 判断是否审核通过
    const isApproved = (this.props.thread?.threadData?.isApproved || 0) === 1;
    if (!isApproved) {
      const currentUserId = this.props.user?.userInfo?.id; // 当前登录用户
      const userId = this.props.thread?.threadData?.user?.userId; // 帖子作者
      // 不是作者自己。跳回首页
      if (!currentUserId || !userId || currentUserId !== userId) {
        Toast.info({ content: '内容正在审核中，审核通过后才能正常显示!' });
        Taro.redirectTo({
          url: `/indexPages/home/index`,
        });
        return;
      }
    }

    await this.getPositionComment(id, postId);

    if (!this.props?.thread?.commentList) {
      this.props.thread.setCommentListPage(this.props.commentPosition?.postsPositionPage || 1);
      const params = {
        id,
        page: this.props.thread.page,
      };
      this.props.thread.loadCommentList(params);
    }

    // 查询打赏人员列表
    this.props.thread.queryTipList({ threadId: id, postId, type: 2, page: 1 });
  }

  // 判断缓存是否可用
  canUseCache() {
    const oldId = this.props?.thread?.threadData?.threadId;
    if (!oldId) return;

    const { id } = getCurrentInstance().router.params;
    if (id && oldId && Number(id) === oldId) return;

    this.props.thread.reset();
  }

  // 获取指定评论位置的相关信息
  async getPositionComment(id, postId) {
    if (!postId) {
      this.props?.commentPosition?.reset();
    }

    // 获取评论所在的页面位置
    if (id && postId) {
      this.props.commentPosition.setPostId(Number(postId));
      const params = {
        threadId: id,
        postId,
        pageSize: 20,
      };
      await this.props.commentPosition.fetchPositionPosts(params);
      // 请求第一页的列表数据
      if (this.props.commentPosition.isShowCommentList) {
        const params1 = {
          id,
        };
        this.props.commentPosition.loadCommentList(params1);
      }
    }
  }

  render() {
    const options = Taro.getLaunchOptionsSync();
    const { serverErrorType } = this.state;
    // 分享朋友圈时，如果页面错误则返回提示
    if (options && options.scene === 1154 && this.state.isServerError) {
      return <ShareError type={serverErrorType}/>;
    }
    return this.state.isServerError ? (
      <ErrorMiniPage text={this.state.serverErrorMsg} />
    ) : (
      <Page>
        <ThreadMiniPage></ThreadMiniPage>
      </Page>
    );
  }
}

// eslint-disable-next-line new-cap
export default Detail;
