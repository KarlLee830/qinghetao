import React from 'react';
import { withRouter } from 'next/router';
import { Icon, Toast } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import BottomEvent from './bottom-event';
import UserInfo from './user-info';
import NoData from '../no-data';
import styles from './index.module.scss';
import h5Share from '@discuzqsdk/sdk/dist/common_modules/share/h5';
import goToLoginPage from '@common/utils/go-to-login-page';
import threadPay from '@common/pay-bussiness/thread-pay';
import ThreadCenterView from './ThreadCenterView';
import { throttle } from '@common/utils/throttle-debounce';
import { debounce, handleAttachmentData } from './utils';
import { noop } from '@components/thread/utils';
import { updateViewCountInStorage } from '@common/utils/viewcount-in-storage';
import canPublish from '@common/utils/can-publish';
import Comment from './comment';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import { updateThreadAssignInfoInLists, updatePayThreadInfo, getThreadCommentList } from '@common/store/thread-list/list-business';

@inject('site')
@inject('index')
@inject('user')
@inject('thread')
@inject('plugin')
@inject('card')
@observer
class Index extends React.Component {
  state = {
    isSendingLike: false,
    showCommentList: false,
  };

  // 分享
  onShare = (e) => {
    e && e.stopPropagation();
    Toast.info({ content: '复制链接成功' });
    this.handleShare();
  }
  handleShare = debounce(() => {
    // 对没有登录的先登录
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    const { title = '', threadId = '', user } = this.props.data || {};

    h5Share({ path: `thread/${threadId}` });
    this.props.index.updateThreadShare({ threadId }).then((result) => {
      if (result.code === 0) {
        updateThreadAssignInfoInLists(threadId, {
          updateType: 'share',
          updatedInfo: result.data,
          user: user.userInfo,
        });
      }
    })
  }, 500)

  // 评论
  onComment = async (e) => {
    e && e.stopPropagation();

    // 判断是否可以进入详情页
    if (!this.allowEnter()) {
      return;
    }

    const { threadId = '', likeReward } = this.props.data || {};

    if (threadId !== '') {
      // 请求评论数据
      if (this.props?.site?.platform === 'h5' && (likeReward.postCount > 0 && !this.state.showCommentList)) {
        this.props.thread.positionToComment();
        this.props.router.push(`/thread/${threadId}`);
        return;
      }
      this.setState({
        showCommentList: !this.state.showCommentList,
      });
      if (!this.state.showCommentList) {
        await getThreadCommentList(threadId, this.props.recomputeRowHeights);
      }
    } else {
      console.log('帖子不存在');
    }
  }

  // 点赞
  onPraise = (e) => {
    e && e.stopPropagation();
    this.updateViewCount();
    this.handlePraise();
  }
  handlePraise = debounce(() => {
    if (this.state.isSendingLike) return;

    // 对没有登录的先登录
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }
    const { data = {}, user, recomputeRowHeights, onPraise } = this.props;
    const { threadId = '', isLike, postId } = data;
    this.setState({ isSendingLike: true });
    this.props.index.updateThreadInfo({ pid: postId, id: threadId, data: { attributes: { isLiked: !isLike } } }).then((result) => {
      if (result.code === 0 && result.data) {
        updateThreadAssignInfoInLists(threadId, {
          updateType: 'like',
          updatedInfo: result.data,
          user: user.userInfo,
          recomputeRowHeights,
        });
        typeof onPraise === 'function' && onPraise({isLiked: result.data.isLiked})
        // const { recomputeRowHeights = noop } = this.props;
        // recomputeRowHeights();
      }else{
        Toast.info({ content: `${result?.msg}` });
      }
      this.setState({ isSendingLike: false });
    });
  }, 1000)

  // 支付
  onPay = (e) => {
    e && e.stopPropagation();
    this.updateViewCount();
    this.handlePay();
  }

  handlePay = debounce(async () => {
    const thread = this.props.data;
    const { success } = await threadPay(thread, this.props.user?.userInfo);

    // 支付成功重新请求帖子数据
    if (success && thread?.threadId) {
      const { code, data } = await this.props.thread.fetchThreadDetail(thread?.threadId);
      if (code === 0 && data) {
        updatePayThreadInfo(thread?.threadId, data);

        const { recomputeRowHeights = noop } = this.props;
        recomputeRowHeights(data);
      }
    }
  }, 1000)

  onClickUser = (e) => {
    e && e.stopPropagation();

    const { user = {}, isAnonymous } = this.props.data || {};
    if (isAnonymous) {
      this.onClick();
    } else {
      this.props.router.push(`/user/${user?.userId}`);
    }
  }

  onClick = throttle(() => {
    // 判断是否可以进入详情页
    if (!this.allowEnter()) {
      return;
    }

    const { threadId = '' } = this.props.data || {};

    if (threadId !== '') {
      this.props.thread.isPositionToComment = false;
      this.props.router.push(`/thread/${threadId}`);
    } else {
      console.log('帖子不存在');
    }

    // 执行外部传进来的点击事件
    const { onClick } = this.props;
    if (typeof onClick === 'function') {
      onClick(this.props.data);
    }
  }, 1000);

  onClickHeaderIcon = (e) => {
    e && e.stopPropagation();

    const { onClickIcon = noop } = this.props;
    onClickIcon(e);
  }

  onOpen = () => {
    const { threadId = '' } = this.props.data || {};

    updateThreadAssignInfoInLists(threadId, { updateType: 'openedMore', openedMore: true, recomputeRowHeights: this.props.recomputeRowHeights });

    // const { recomputeRowHeights = noop } = this.props;
    // recomputeRowHeights();
  }
  onClose = () => {
    const { threadId = '' } = this.props.data || {};
    updateThreadAssignInfoInLists(threadId, { updateType: 'openedMore', openedMore: false, recomputeRowHeights: this.props.recomputeRowHeights });
    // const { recomputeRowHeights = noop } = this.props;
    // recomputeRowHeights();
  }

  // 判断能否进入详情逻辑
  allowEnter = () => {
    const { ability } = this.props.data || {};
    const { canViewPost } = ability;

    if (!canViewPost) {
      const isLogin = this.props.user.isLogin();
      if (!isLogin) {
        Toast.info({ content: '请先登录!' });
        goToLoginPage({ url: '/user/login' });
      } else {
        Toast.info({ content: '暂无权限查看详情，请联系管理员' });
      }
      return false;
    }
    return true;
  };

  // 点击评论列表中查看更多
  onViewMoreClick = () => {
    // 判断是否可以进入详情页
    if (!this.allowEnter()) {
      return;
    }

    const { threadId = '' } = this.props.data || {};

    if (threadId !== '') {
      this.props.thread.positionToComment();
      this.props.router.push(`/thread/${threadId}`);
    } else {
      console.log('帖子不存在');
    }
  };

  // 删除评论
  deleteComment = () => {
    const postCount = this.props.data?.likeReward?.postCount;

    if (postCount > 0) {
      const { data } = this.props;
      const { threadId = '' } = data || {};
      updateThreadAssignInfoInLists(threadId, {
        updateType: 'decrement-comment',
      });

      if (postCount - 1 === 0) {
        this.setState({
          showCommentList: false,
        });
      }
    }
  };

  // 新增评论
  createComment = () => {
    const { data } = this.props;
    const { threadId = '' } = data || {};

    // 新增评论以后进入详情页需要刷新帖子数据
    if (this.props.thread?.threadData) {
      this.props.thread.threadData.needupdate = true;
    }
    updateThreadAssignInfoInLists(threadId, {
      updateType: 'comment',
    });
  };

  updateViewCount = async () => {
    const { data, site } = this.props;
    const { threadId = '' } = data || {};
    const { openViewCount } = site?.webConfig?.setSite || {};

    const viewCountMode = Number(openViewCount);
    if (viewCountMode === 1) return;

    const threadIdNumber = Number(threadId);
    const viewCount = await updateViewCountInStorage(threadIdNumber);
    if (viewCount) {
      updateThreadAssignInfoInLists(threadIdNumber, {
        updateType: 'viewCount',
        updatedInfo: { viewCount },
      });
    }
  }

  render() {
    const { plugin, index, thread, data, card, className = '', site = {}, showBottomStyle = true, collect = '', unifyOnClick = null, isShowIcon = false, user: users, onTextItemClick = null, extraTag, extraInfo } = this.props;
    const { platform = 'pc' } = site;
    const threadStore = this.props.thread;
    const { onContentHeightChange = noop, onImageReady = noop, onVideoReady = noop } = this.props;
    if (!data) {
      return <NoData />;
    }


    const {
      user = {},
      position = {},
      likeReward = {},
      viewCount,
      group,
      createdAt,
      isLike,
      postId,
      threadId,
      displayTag,
      payType,
      isAnonymous,
      diffTime,
      commentList,
    } = data || {};
    const { isEssence, isPoster, isPrice, isRedPack, isReward } = displayTag || {};

    const {redPacketData} = handleAttachmentData(data.content);

    const hasCommentHongbao = redPacketData && redPacketData.condition === 0 && redPacketData.remainNumber > 0;
    return (
      <div className={`${styles.container} ${className} ${showBottomStyle && styles.containerBottom} ${platform === 'pc' && styles.containerPC}`}>
        <div className={styles.header} onClick={unifyOnClick || this.onClick}>
          <UserInfo
            name={user.nickname || ''}
            avatar={user.avatar || ''}
            location={position.location}
            view={`${viewCount}`}
            groupName={group?.groupName}
            groupLevel={group?.level}
            time={diffTime}
            isEssence={isEssence}
			isPoster={isPoster}
            isPay={isPrice}
            isRed={isRedPack}
            isReward={isReward}
            isAnonymous={isAnonymous}
            userId={user?.userId}
            platform={platform}
            collect={collect}
            onClick={unifyOnClick || this.onClickUser}
            unifyOnClick={unifyOnClick}
            extraTag={extraTag}
            extraInfo={extraInfo}
          />
          {isShowIcon && <div className={styles.headerIcon} onClick={unifyOnClick || this.onClickHeaderIcon}><Icon name='CollectOutlinedBig' size={20}></Icon></div>}
        </div>

        <ThreadCenterView
          site={site}
          plugin={{
            pluginComponent: plugin.pluginComponent,
            plugin: {
              setPluginStore: plugin.setPluginStore,
              getPluginStore: plugin.getPluginStore,
            }
          }}
          user={users}
          updateThread={thread.updateThread.bind(thread)}
          updateListThreadIndexes={index.updateListThreadIndexes.bind(index)}
          onContentHeightChange={onContentHeightChange}
          onImageReady={onImageReady}
          onVideoReady={onVideoReady}
          data={data}
          threadId={data.threadId}
          onClick={unifyOnClick || this.onClick}
          onPay={unifyOnClick || this.onPay}
          unifyOnClick={unifyOnClick}
          platform={platform}
          onOpen={this.onOpen}
          onClose={this.onClose}
          updateViewCount={this.updateViewCount}
          recomputeRowHeights={(data) => {
            if (this.props.recomputeRowHeights && typeof this.props.recomputeRowHeights === 'function') {
              this.props.recomputeRowHeights(data);
            }
          }}
          onTextItemClick={onTextItemClick}
        />

        <BottomEvent
          data={data}
          card={card}
          user={users}
          userImgs={likeReward.users}
          wholeNum={likeReward.likePayCount || 0}
          comment={likeReward.postCount || 0}
          sharing={likeReward.shareCount || 0}
          onShare={unifyOnClick || this.onShare}
          handleShare={unifyOnClick || this.handleShare}
          onComment={unifyOnClick || this.onComment}
          onPraise={unifyOnClick || this.onPraise}
          isLiked={isLike}
          isCommented={this.state.showCommentList}
          isSendingLike={this.state.isSendingLike}
          tipData={{ postId, threadId, platform, payType }}
          platform={platform}
          updateViewCount={this.updateViewCount}
          hasCommentHongbao={hasCommentHongbao}
        />


        {/* 评论列表 */}
        {this.props.enableCommentList && this.state.showCommentList && (
          <Comment
            thread={{
              threadData: {
                id: data.threadId,
                ...data,
              },
            }}
            threadStore={threadStore}
            userInfo={this.props.user.userInfo}
            canPublish={(type) => canPublish(users, site, type, data.threadId)}
            commentList={commentList}
            deleteComment={this.deleteComment}
            createComment={this.createComment}
            isLoading={data.isLoading}
            requestError={data.requestError}
            postCount={data?.likeReward?.postCount}
            onViewMoreClick={this.onViewMoreClick}
            platform={platform}
          ></Comment>
        )}
      </div>
    );
  }
}

Index.defaultProps = {
  enableCommentList: true, // 是否开启评论列表
};

// eslint-disable-next-line new-cap
export default withRouter(Index);
