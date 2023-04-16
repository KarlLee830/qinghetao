import React from 'react';
import styles from './index.module.scss';
import Spin from '@discuzqsdk/design/dist/components/spin/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import UserCenterHeaderImage from '@components/user-center-header-images';
import UserCenterHead from '@components/user-center-head';
import { inject, observer } from 'mobx-react';
import UserCenterThreads from '@components/user-center-threads';
import BaseLayout from '@components/base-layout';
import Router from '@discuzqsdk/sdk/dist/router';
import Taro, { getImageInfo, getCurrentInstance, eventCenter } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';

import SectionTitle from '@components/section-title';
import BottomView from '@components/list/BottomView';
import PacketOpen from '@components/red-packet-animation';
import ImagePreviewer from '@discuzqsdk/design/dist/components/image-previewer/index';
import LoginHelper from '@common/utils/login-helper';
@inject('site')
@inject('user')
@inject('thread')
@inject('threadList')
@observer
class H5OthersPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fetchUserInfoLoading: true,
      previewBackgroundUrl: null, // 预览背景图片链接
      isNormalTitle: false
    };

    this.previewBackgroundLoading = false; // 预览背景图片是否在预加载

    const { id = '' } = getCurrentInstance().router.params;

    if (this.props.user.targetUsers[id]) {
      this.state.fetchUserInfoLoading = false;
    }
    // 因为这里的 onShow 的 flag 是路由，导致如果进入多个用户信息页面，重复触发了
    // 一个页面只负责一个用户 id，用此 flag 来解决重复加载的问题
    this.targetUserId = null;
    this.isPreivewImage = null;
  }

  $instance = getCurrentInstance();

  previewerRef = React.createRef(null);

  componentWillMount() {
    const onShowEventId = this.$instance.router.onShow;
    // 监听
    eventCenter.on(onShowEventId, this.onShow);
  }

  setNavigationBarStyle = () => {
    Taro.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#ffffff',
    });
  };

  updatePreviewImageStatus = (bol) => {
    this.isPreivewImage = bol;
  };

  onShow = async () => {
    const { id = '' } = getCurrentInstance().router.params;
    if (!id) {
      Router.replace({ url: '/indexPages/home/index' });
    }
    if (!this.targetUserId) {
      this.targetUserId = id;
    }
    // 仅当前激活 id 的事件会触发
    if (this.targetUserId !== id) return;
    const myId = this.props.user?.id;
    if (String(myId) === this.targetUserId) {
      Router.replace({ url: '/userPages/my/index' });
      return;
    }

    if (this.targetUserId) {
      // 如果是预览图片操作 就不需要重新更新状态
      if (this.isPreivewImage) {
        this.isPreivewImage = false;
        return;
      }

      if (!this.props.user.targetUsers[this.targetUserId]) {
        this.setState({
          fetchUserInfoLoading: true,
        });
      }

      await this.props.user.getTargetUserInfo({ userId: this.targetUserId });

      await this.getBackgroundUrl();

      this.setState({
        fetchUserInfoLoading: false,
      });

      const targetUserThreadsList = await this.props.threadList.fetchList({
        namespace: `user/${this.targetUserId}`,
        filter: {
          toUserId: this.targetUserId,
          complex: 5,
        },
      });

      this.props.threadList.setList({ namespace: `user/${this.targetUserId}`, data: targetUserThreadsList });
    }
  };

  componentDidMount = async () => {
    this.setNavigationBarStyle();
    const { id = '' } = getCurrentInstance().router.params;
    const myId = this.props.user?.id;

    if (String(myId) === id) {
      Router.replace({ url: '/userPages/my/index' });
      return;
    }
  };

  componentWillUnmount() {
    const onShowEventId = this.$instance.router.onShow;
    // 卸载
    eventCenter.off(onShowEventId, this.onShow);
  }

  fetchTargetUserThreads = async () => {
    const { id = '' } = getCurrentInstance().router.params;
    if (id) {
      const targetUserThreadsList = await this.props.threadList.fetchList({
        namespace: `user/${id}`,
        filter: {
          toUserId: id,
          complex: 5,
        },
      });
      this.props.threadList.setList({ namespace: `user/${id}`, data: targetUserThreadsList });
    }
    return;
  };

  formatUserThreadsData = (targetUserThreads) => {
    if (Object.keys(targetUserThreads).length === 0) return [];
    return Object.values(targetUserThreads).reduce((fullData, pageData) => [...fullData, ...pageData]);
  };

  getStatusBarHeight() {
    return wx?.getSystemInfoSync()?.statusBarHeight || 44;
  }

  getTopBarStyle() {
    if (this.state.isNormalTitle) {
      return {
        position: 'fixed',
        top: 0,
        height: `${this.getStatusBarHeight() + 50}px`,
        zIndex: 1000,
        width: '100%',
        maxWidth: '100%',
        backgroundColor: 'white',
      };
    }
  }

  // 全屏状态下自定义左上角返回按钮位置
  getTopBarBtnStyle() {
    const style = {
      position: 'fixed',
      top: `${this.getStatusBarHeight()}px`,
      left: '12px',
      transform: 'translate(0, 10px)'
    }
    if (this.state.isNormalTitle) {
      style.backgroundColor = 'white';
      style.color = 'black';
    }
    return style;
  }

  getTopBarTitleStyle() {
    const style = {
      position: 'fixed',
      top: `${this.getStatusBarHeight()}px`,
      left: '50%',
      transform: 'translate(-50%, 8px)'
    }
    if (this.state.isNormalTitle) {
      style.backgroundColor = 'white';
      style.color = 'black';
    }
    return style;
  }

  handleBack = () => {
    const { share = '' } = getCurrentInstance().router.params;
    if (share === 'true') {
      LoginHelper.gotoIndex();
    } else {
      Taro.navigateBack();
    }
  };

  // 渲染顶部title
  renderTitleContent = () => {
    const { id = ''} = getCurrentInstance().router.params;
    const { user } = this.props;
    const { isNormalTitle } = this.state;

    if (user.targetUsers[id]) {
      return (
        <View className={styles.topBar} style={this.getTopBarStyle()}>
          <View onClick={this.handleBack} className={styles.customCapsule} style={this.getTopBarBtnStyle()}>
            <Icon size={20} name='LeftOutlined' color={ isNormalTitle && 'black'}/>
          </View>
          <View style={this.getTopBarTitleStyle()} className={styles.fullScreenTitle}>
            {user.targetUsers[id]?.nickname}的主页
          </View>
        </View>
      );
    }

    return (
      <View className={styles.topBar} style={this.getTopBarStyle()}>
        <View onClick={this.handleBack} className={styles.customCapsule} style={this.getTopBarBtnStyle()}>
          <Icon size={20} name='LeftOutlined' color={ isNormalTitle && 'black'}/>
        </View>
      </View>
    );
  };

  getBackgroundUrl = async () => {
    const { id = '' } = getCurrentInstance().router.params;

    let backgroundPreviewUrl = '';

    if (id && this.props.user?.targetUsers[id]) {
      const targetUsers = this.props.user.targetUsers[id];
      if (targetUsers.originalBackGroundUrl) {
        try {
          await getImageInfo({
            src: targetUsers.originalBackGroundUrl,
          });
          backgroundPreviewUrl = targetUsers.originalBackGroundUrl;
        } catch (e) {
          console.log(e);
        }
      }

      if (targetUsers.backgroundUrl) {
        if (!backgroundPreviewUrl) {
          try {
            await getImageInfo({
              src: targetUsers.backgroundUrl,
            });
            backgroundPreviewUrl = targetUsers.backgroundUrl;
          } catch (e) {
            console.log(e);
          }
        }
      }

    }

    if (backgroundPreviewUrl) {
      this.setState({
        previewBackgroundUrl: backgroundPreviewUrl,
      });
    }

  };

  showPreviewerRef = () => {
    if (this.previewerRef.current) {
      this.previewerRef.current.show();
    }
  };

  handlePreviewBgImage = (e) => {
    e && e.stopPropagation();
    if (!this.state.previewBackgroundUrl) return;
    this.isPreivewImage = true;
    this.showPreviewerRef();
  };

  render() {
    const { site, user, thread, threadList} = this.props;
    const { platform } = site;
    const { targetUserId } = this;
    const { lists } = threadList;
    const { hasRedPacket } = thread;
    const { previewBackgroundUrl } = this.state;

    const userThreadsList = threadList.getList({
      namespace: `user/${targetUserId}`,
    });

    const totalPage = threadList.getAttribute({
      namespace: `user/${targetUserId}`,
      key: 'totalPage',
    });

    const totalCount = threadList.getAttribute({
      namespace: `user/${targetUserId}`,
      key: 'totalCount',
    });

    const currentPage = threadList.getAttribute({
      namespace: `user/${targetUserId}`,
      key: 'currentPage',
    });

    return (
      <BaseLayout
        showHeader={false}
        showTabBar={false}
        immediateCheck
        onRefresh={this.fetchTargetUserThreads}
        noMore={totalPage < currentPage}
        showLoadingInCenter={!userThreadsList.length}
        onScroll={(e) => {
          const currentScrollTop = e.detail.scrollTop;
          if (currentScrollTop > 170) {
            this.setState({
              isNormalTitle: true,
            });
          } else {
            this.setState({
              isNormalTitle: false,
            });
          }
        }}
      >
        <View className={styles.mobileLayout}>
          {this.renderTitleContent()}
          {this.state.fetchUserInfoLoading && (
            <BottomView className={styles.loadingBox} isBox loadingText="加载中..." />
          )}
          <View
            style={{
              display: !this.state.fetchUserInfoLoading ? 'block' : 'none',
            }}
          >
            <View onClick={this.handlePreviewBgImage}>
              <UserCenterHeaderImage isOtherPerson />
            </View>
            <UserCenterHead
              updatePreviewImageStatus={this.updatePreviewImageStatus}
              platform={platform}
              isOtherPerson
            />
          </View>

          <View className={styles.unit}>
            {/* <View className={styles.threadUnit}>
              <View className={styles.threadTitle}>主题</View>
              <View className={styles.threadCount}>{targetUserThreadsTotalCount}个主题</View>
            </View> */}

            {/* <View className={styles.ViewiderContainer}>
              <Viewider className={styles.Viewider} />
            </View> */}

            <View className={styles.threadHeader}>
              <SectionTitle title="主题" isShowMore={false} leftNum={`${totalCount || 0}个主题`} />
            </View>

            <View className={styles.threadItemContainer}>
              {userThreadsList.length > 0 && <UserCenterThreads showBottomStyle={false} data={userThreadsList} />}
            </View>
          </View>
        </View>
        {previewBackgroundUrl && (
          <ImagePreviewer ref={this.previewerRef} imgUrls={[previewBackgroundUrl]} currentUrl={previewBackgroundUrl} />
        )}
        {hasRedPacket > 0 && <PacketOpen money={hasRedPacket} onClose={() => thread.setRedPacket(0)} />}
      </BaseLayout>
    );
  }
}

export default H5OthersPage;
