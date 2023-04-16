/* eslint-disable spaced-comment */
import React from 'react';
import styles from './index.module.scss';
import { Divider, Spin, ImagePreviewer } from '@discuzqsdk/design';
import UserCenterHeaderImage from '@components/user-center-header-images';
import UserCenterHead from '@components/user-center-head';
import { inject, observer } from 'mobx-react';
import UserCenterPost from '@components/user-center-post';
import UserCenterAction from '@components/user-center-action';
import UserCenterThreads from '@components/user-center-threads';
import BaseLayout from '@components/base-layout';
import NoData from '@components/no-data';
import PacketOpen from '@components/red-packet-animation/h5';
import { withRouter } from 'next/router';
import Router from '@discuzqsdk/sdk/dist/router';
import setWxShare from '@common/utils/set-wx-share';

// 插件引入
/**DZQ->plugin->register<plugin_user@user_extension_left_layout_hook>**/

@inject('site')
@inject('user')
@inject('thread')
@inject('threadList')
@observer
class H5OthersPage extends React.Component {
  constructor(props) {
    super(props);
    const { query } = this.props.router;
    this.state = {
      fetchUserInfoLoading: true,
      isPreviewBgVisible: false, // 是否预览背景图
    };

    if (this.props.user.targetUsers[query.id]) {
      this.state.fetchUserInfoLoading = false;
    }
  }

  targetUserId = null;

  componentDidMount = async () => {
    const { query } = this.props.router;
    const id = this.props.user?.id;
    if (!query.id || query.id === 'undefined') {
      Router.replace({ url: '/' });
    }
    if (String(id) === query.id) {
      Router.replace({ url: '/my' });
      return;
    }
    if (query.id) {
      await this.props.user.getTargetUserInfo({ userId: query.id });
      this.setWeixinShare();
      this.targetUserId = query.id;
      this.setState({
        fetchUserInfoLoading: false,
      });
    }
  };

  // 用来处理浅路由跳转
  componentDidUpdate = async () => {
    const { query } = this.props.router;
    const id = this.props.user?.id;
    if (!query.id || query.id === 'undefined') {
      Router.replace({ url: '/' });
    }
    if (String(id) === query.id) {
      Router.replace({ url: '/my' });
      return;
    }

    // cdm 周期不触发
    if (!this.targetUserId) return;

    if (String(this.targetUserId) === String(query.id)) return;
    this.targetUserId = query.id;
    if (query.id) {
      if (!this.props.user.targetUsers[query.id]) {
        this.setState({
          fetchUserInfoLoading: true,
        });
      }

      this.setState({
        fetchUserThreadsLoading: true,
      });

      await this.props.user.getTargetUserInfo({ userId: query.id });
      this.setWeixinShare();
      this.setState({
        fetchUserInfoLoading: false,
      });
      await this.fetchTargetUserThreads();
    }
  }

  // 设置微信分享内容
  setWeixinShare() {
    setTimeout(() => {
      const { targetUser } = this.props.user;
      if (targetUser) {
        const { nickname, avatarUrl, signature, id } = targetUser;
        const title = `${nickname}的主页`;
        const img = avatarUrl;
        const desc = signature
          ? (signature.length > 35 ? `${signature.substr(0, 35)}...` : signature)
          : '在这里，发现更多精彩内容';
        const link = `${window.location.origin}/user/${id}`;
        setWxShare(title, desc, link, img);
      }
    }, 500);
  }

  fetchTargetUserThreads = async () => {
    const { query } = this.props.router;
    if (query.id) {
      const targetUserThreadsList = await this.props.threadList.fetchList({
        namespace: `user/${query.id}`,
        filter: {
          toUserId: query.id,
          complex: 5,
        },
      });
      this.props.threadList.setList({ namespace: `user/${query.id}`, data: targetUserThreadsList });
    }
    return;
  };

  formatUserThreadsData = (targetUserThreads) => {
    if (Object.keys(targetUserThreads).length === 0) return [];
    return Object.values(targetUserThreads).reduce((fullData, pageData) => [...fullData, ...pageData]);
  };

  handlePreviewBgImage = (e) => {
    e && e.stopPropagation();
    this.setState({
      isPreviewBgVisible: !this.state.isPreviewBgVisible,
    });
  };

  getBackgroundUrl = () => {
    let backgroundUrl = null;
    const { query } = this.props.router;
    const id = query?.id;
    if (id && this.props.user?.targetUsers[id]) {
      backgroundUrl = this.props.user.targetUsers[id].originalBackGroundUrl;
    }
    if (!backgroundUrl) return false;
    return backgroundUrl;
  };

  render() {
    const { site, user, thread, threadList } = this.props;
    const { platform } = site;
    const { lists } = threadList;
    const { hasRedPacket } = thread;

    const { query = {} } = this.props.router;

    const id = query?.id;

    const userThreadsList = threadList.getList({
      namespace: `user/${id}`,
    });

    const totalPage = threadList.getAttribute({
      namespace: `user/${id}`,
      key: 'totalPage',
    });

    const totalCount = threadList.getAttribute({
      namespace: `user/${id}`,
      key: 'totalCount',
    });

    const currentPage = threadList.getAttribute({
      namespace: `user/${id}`,
      key: 'currentPage',
    });

    return (
      <BaseLayout
        showHeader={true}
        showTabBar={false}
        immediateCheck={true}
        onRefresh={this.fetchTargetUserThreads}
        noMore={totalPage < currentPage}
        showRefresh={!this.state.fetchUserInfoLoading}
      >
        <div className={styles.mobileLayout}>
          {this.state.fetchUserInfoLoading && (
            <div className={styles.loadingSpin}>
              <Spin type="spinner">加载中...</Spin>
            </div>
          )}
          {!this.state.fetchUserInfoLoading && (
            <>
              <div onClick={this.handlePreviewBgImage}>
                <UserCenterHeaderImage isOtherPerson={true} />
              </div>
              <UserCenterHead platform={platform} isOtherPerson={true} />
            </>
          )}

          <div className={styles.unit}>
            <div className={styles.threadUnit}>
              <div className={styles.threadTitle}>主题</div>
              <div className={styles.threadCount}>{totalCount === undefined ? '' : `${totalCount}个主题`}</div>
            </div>

            <div className={styles.dividerContainer}>
              <Divider className={styles.divider} />
            </div>

            <div className={styles.threadItemContainer}>
              {userThreadsList.length > 0 && (
                  <UserCenterThreads data={userThreadsList} />
              )}
            </div>
          </div>
        </div>
        {this.getBackgroundUrl() && this.state.isPreviewBgVisible && (
          <ImagePreviewer
            visible={this.state.isPreviewBgVisible}
            onClose={this.handlePreviewBgImage}
            imgUrls={[this.getBackgroundUrl()]}
            currentUrl={this.getBackgroundUrl()}
            onError={() => (id && this.props.user?.targetUsers[id] && this.props.user.targetUsers[id].backgroundUrl) || ''}
          />
        )}
        {hasRedPacket > 0 && <PacketOpen money={hasRedPacket} onClose={() => thread.setRedPacket(0)}  />}
      </BaseLayout>
    );
  }
}

export default withRouter(H5OthersPage);
