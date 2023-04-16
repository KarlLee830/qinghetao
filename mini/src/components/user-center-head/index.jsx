import React, { Component } from 'react';
import { computed } from 'mobx';
import { inject, observer } from 'mobx-react';
import Avatar from '@components/avatar';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Spin from '@discuzqsdk/design/dist/components/spin/index';
import ImagePreviewer from '@discuzqsdk/design/dist/components/image-previewer/index';
import clearLoginStatus from '@common/utils/clear-login-status';
import Router from '@discuzqsdk/sdk/dist/router';
import { getCurrentInstance } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import throttle from '@common/utils/thottle.js';
import LoginHelper from '@common/utils/login-helper';
import MemberShipCard from '@components/member-ship-card';
import checkImgExists from '@common/utils/check-image-exists';
import MemberBadge from '@components/member-badge';

@inject('site')
@inject('user')
@observer
class index extends Component {
  static defaultProps = {
    isOtherPerson: false, // 表示是否是其他人
  };

  constructor(props) {
    super(props);
    const { id } = getCurrentInstance().router.params;
    this.state = {
      isFollowedLoading: false, // 是否点击关注
      isPreviewAvatar: false, // 是否预览头像
      previewAvatarUrl: null, // 预览头像链接
    };

    this.targetUserId = id;
  }

  async componentDidMount() {
    // const { previewAvatarUrl } = this.state;
    // const { user } = this.props;
    // if(previewAvatarUrl === user.avatarUrl) {
    //   return;
    // }
    // const imgUrl = await checkImgExists(user.originalAvatarUrl, user.avatarUrl);
    // this.setState({
    //   previewAvatarUrl: imgUrl
    // })
  }

  previewerRef = React.createRef(null);

  // 点击屏蔽
  handleChangeShield = throttle(async (isDeny) => {
    const { id } = getCurrentInstance().router.params;
    if (isDeny) {
      await this.props.user.undenyUser(id);
      this.props.user.setTargetUserNotBeDenied({ userId: id });
      Toast.success({
        content: '解除屏蔽成功',
        hasMask: false,
        duration: 1000,
      });
    } else {
      await this.props.user.denyUser(id);
      this.props.user.setTargetUserDenied({ userId: id });
      Toast.success({
        content: '屏蔽成功',
        hasMask: false,
        duration: 1000,
      });
    }
  }, 1000);

  // 点击关注
  handleChangeAttention = throttle(async (follow) => {
    const { id } = getCurrentInstance().router.params;
    if (id) {
      if (follow !== 0) {
        try {
          this.setState({
            isFollowedLoading: true,
          });
          const cancelRes = await this.props.user.cancelFollow({ id, type: 1 });
          if (!cancelRes.success) {
            Toast.error({
              content: cancelRes.msg || '取消关注失败',
              duration: 2000,
            });
            this.setState({
              isFollowedLoading: false,
            });
          } else {
            await this.props.user.getTargetUserInfo({ userId: id });
            Toast.success({
              content: '操作成功',
              hasMask: false,
              duration: 2000,
            });
            this.setState({
              isFollowedLoading: false,
            });
          }
        } catch (error) {
          console.error(error);
          Toast.error({
            content: '网络错误',
            duration: 2000,
          });
          this.setState({
            isFollowedLoading: false,
          });
        }
      } else {
        try {
          this.setState({
            isFollowedLoading: true,
          });
          const followRes = await this.props.user.postFollow(id);
          if (!followRes.success) {
            Toast.error({
              content: followRes.msg || '关注失败',
              duration: 2000,
            });
            this.setState({
              isFollowedLoading: false,
            });
          } else {
            await this.props.user.getTargetUserInfo({ userId: id });
            Toast.success({
              content: '操作成功',
              hasMask: false,
              duration: 2000,
            });
            this.setState({
              isFollowedLoading: false,
            });
          }
        } catch (error) {
          console.error(error);
          Toast.error({
            content: '网络错误',
            duration: 2000,
          });
          this.setState({
            isFollowedLoading: false,
          });
        }
      }
    }
  }, 1000);

  logout = () => {
    clearLoginStatus();
    LoginHelper.clear();

    const siteMode = this.props.site?.webConfig?.setSite?.siteMode;
    const url = siteMode === 'pay' ? '/subPages/forum/partner-invite/index' : '/indexPages/home/index';

    Router.reLaunch({
      url,
      complete: () => {
        setTimeout(() => {
          this.props.user.removeUserInfo();
          this.props.site.getSiteInfo();
        }, 300);
      },
    });
  };

  // 点击粉丝列表
  goToFansList = () => {
    const { id } = getCurrentInstance().router.params;
    if (id) {
      Router.push({ url: `/userPages/my/fans/index?isOtherPerson=${this.props.isOtherPerson}&otherId=${id}` });
    } else {
      Router.push({ url: `/userPages/my/fans/index?isOtherPerson=${this.props.isOtherPerson}` });
    }
  };

  // 点击关注列表
  goToFollowsList = () => {
    const { id } = getCurrentInstance().router.params;
    if (id) {
      Router.push({ url: `/userPages/my/follows/index?isOtherPerson=${this.props.isOtherPerson}&otherId=${id}` });
    } else {
      Router.push({ url: `/userPages/my/follows/index?isOtherPerson=${this.props.isOtherPerson}` });
    }
  };

  // 点击编辑资料
  goToMyEditInfo = () => {
    Router.push({ url: `edit/index` });
  };

  // 点击发送私信
  handleMessage = () => {
    const { id, nickname } = this.targetUser;
    Router.push({ url: `/subPages/message/index?page=chat&userId=${id}&nickname=${nickname}` });
  };

  // 点击我的点赞
  handleMyLike = () => {
    const { id } = getCurrentInstance().router.params;
    if (id) {
      return;
    }
    Router.push({ url: '/userPages/my/like/index' });
  };

  // 渲染关注状态
  renderFollowedStatus = (follow) => {
    let icon = '';
    let text = '';
    switch (follow) {
      case 0: // 表示未关注
        icon = 'PlusOutlined';
        text = '关注';
        break;
      case 1:
        icon = 'CheckOutlined';
        text = '已关注';
        break;
      case 2:
        icon = 'WithdrawOutlined';
        text = '相互关注';
        break;
      default:
        break;
    }
    return { icon, text };
  };

  showPreviewerRef = () => {
    if (this.previewerRef.current) {
      this.props.updatePreviewImageStatus && this.props.updatePreviewImageStatus(true);
      this.previewerRef.current.show();
    }
  };

  // 点击头像预览
  handlePreviewAvatar = (e) => {
    e && e.stopPropagation();
    this.showPreviewerRef();
  };

  // 点击去到续费页面
  onRenewalFeeClick = () => {
    Router.push({
      url: '/userPages/my/renew/index',
    });
  };

  // 是否显示续费卡片
  whetherIsShowRenewalCard = () => !this.props.user?.isAdmini && !this.props.isOtherPerson;

  @computed get targetUser() {
    if (this.targetUserId) {
      return this.props.user.targetUsers[this.targetUserId];
    }
    return {};
  }

  setPreviewAvatarUrl = async () => {
    const user = this.props.isOtherPerson ? this.targetUser || {} : this.props.user;
    if (!user) return;
    const imgUrl = await checkImgExists(user.originalAvatarUrl, user.avatarUrl);
    imgUrl && this.setState({
      previewAvatarUrl: imgUrl
    })
  }

  render() {
    const { targetUser } = this;
    const user = this.props.isOtherPerson ? targetUser || {} : this.props.user;
    const { webConfig: { other: { threadOptimize } } } = this.props.site;
    const { previewAvatarUrl } = this.state;
    !previewAvatarUrl && this.setPreviewAvatarUrl();

    return (
      <View className={styles.h5box}>
        {/* 上 */}
        <View className={styles.h5boxTop}>
          <View
            className={styles.headImgBox}
            key={user.avatarUrl || new Date()}
            onClick={user.avatarUrl && this.handlePreviewAvatar}
          >
            <Avatar image={user.avatarUrl} size="big" name={user.nickname} />
          </View>
          {/* 粉丝|关注|点赞 */}
          <View className={styles.userMessageList}>
            <View onClick={this.goToFansList} className={styles.userMessageListItem}>
              <Text className={styles.useText}>粉丝</Text>
              <Text>{user.fansCount || 0}</Text>
            </View>
            <View onClick={this.goToFollowsList} className={styles.userMessageListItem}>
              <Text className={styles.useText}>关注</Text>
              <Text>{user.followCount || 0}</Text>
            </View>
            <View onClick={this.handleMyLike} className={styles.userMessageListItem}>
              <Text className={styles.useText}>点赞</Text>
              <Text>{user.likedCount || 0}</Text>
            </View>
          </View>
        </View>
        {/* 中 用户昵称和他所在的用户组名称 */}
        <View>
          <View className={styles.userNameOrTeam}>
            <Text className={styles.userNickname}>{user.nickname}</Text>
            { user.group?.level > 0 ? (
              <View className={styles.memberBadge}>
                <MemberBadge
                  hasBg
                  groupLevel={user.group?.level}
                  groupName={user.group?.groupName}
                />
              </View>
            ) : (
              <Text className={styles.groupName}>{user.group?.groupName}</Text>
            )}
          </View>
          <Text className={styles.text}>{user.signature || '这个人很懒，什么也没留下~'}</Text>
        </View>
        {/* 下 */}
        <View className={styles.userBtn}>
          {this.props.isOtherPerson ? (
            <>
              <Button
                disabled={this.state.isFollowedLoading}
                onClick={() => {
                  this.handleChangeAttention(user.follow);
                }}
                type="primary"
                className={`${styles.btn} ${user.follow === 2 && styles.userFriendsBtn} ${user.follow === 1 && styles.userFollowedBtn
                  }`}
                full
              >
                <View className={styles.actionButtonContentWrapper}>
                  {this.state.isFollowedLoading ? (
                    <Spin size={16} type="spinner"></Spin>
                  ) : (
                    <Icon name={this.renderFollowedStatus(user.follow).icon} size={16} />
                  )}
                  <Text className={styles.userBtnText}>{this.renderFollowedStatus(user.follow).text}</Text>
                </View>
              </Button>
              {threadOptimize ? (
                <Button full className={styles.btn} onClick={this.handleMessage}>
                  <View className={styles.actionButtonContentWrapper}>
                    <Icon name="NewsOutlined" size={16} />
                    <Text className={styles.userBtnText}>发私信</Text>
                  </View>
                </Button>
              ) : null}
            </>
          ) : (
            <>
              <Button full className={styles.btn} onClick={this.goToMyEditInfo} type="primary">
                <View className={styles.actionButtonContentWrapper}>
                  <Icon name="CompileOutlined" size={16} />
                  <Text className={styles.userBtnText}>编辑资料</Text>
                </View>
              </Button>
              <Button full className={styles.btn} onClick={this.logout}>
                <View className={styles.actionButtonContentWrapper}>
                  <Icon name="PoweroffOutlined" size={16} />
                  <Text className={styles.userBtnText}>退出登录</Text>
                </View>
              </Button>
            </>
          )}
        </View>
        {this.whetherIsShowRenewalCard() && <MemberShipCard onRenewalFeeClick={this.onRenewalFeeClick} />}
        {/* 右上角屏蔽按钮 */}
        {this.props.isOtherPerson && (
          <View
            onClick={() => {
              this.handleChangeShield(user.isDeny);
            }}
            className={styles.shieldBtn}
          >
            <Icon name="ShieldOutlined" size={14} />
            <Text className={styles.shieldText}>{user.isDeny ? '解除屏蔽' : '屏蔽'}</Text>
          </View>
        )}
        {previewAvatarUrl && (
          <ImagePreviewer
            ref={this.previewerRef}
            imgUrls={[previewAvatarUrl]}
            currentUrl={previewAvatarUrl}
          />
        )}
      </View>
    );
  }
}

export default index;
