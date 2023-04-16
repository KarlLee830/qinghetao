import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import Avatar from '@components/avatar';
import { computed } from 'mobx';
import { Button, Icon, Toast, Spin, ImagePreviewer } from '@discuzqsdk/design';
import clearLoginStatus from '@common/utils/clear-login-status';
import Router from '@discuzqsdk/sdk/dist/router';
import { withRouter } from 'next/router';
import { numberFormat } from '@common/utils/number-format';
import browser from '@common/utils/browser';
import throttle from '@common/utils/thottle.js';
import LoginHelper from '@common/utils/login-helper.js';
import MemberShipCard from '@components/member-ship-card';
import MemberBadge from '@components/member-badge';

@inject('user')
@inject('site')
@observer
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFollowedLoading: false, // 是否点击关注
      isPreviewAvatar: false, // 是否预览头像
    };
  }

  static defaultProps = {
    isOtherPerson: false, // 表示是否是其他人
  };

  componentDidMount() {
    const id = this.props.user?.id;
    this.props.user.updateUserInfo(id);


  }

  // 点击屏蔽
  handleChangeShield = throttle(async (isDeny) => {
    const id = this.props.router.query?.id;
    if (isDeny) {
      await this.props.user.undenyUser(id);
      this.props.user.setTargetUserNotBeDenied({ userId: id });
      Toast.success({
        content: '解除屏蔽成功',
        hasMask: false,
        duration: 2000,
      });
    } else {
      await this.props.user.denyUser(id);
      this.props.user.setTargetUserDenied({ userId: id });
      Toast.success({
        content: '屏蔽成功',
        hasMask: false,
        duration: 2000,
      });
    }
  }, 1000);

  // 点击关注
  handleChangeAttention = throttle(async (follow) => {
    const id = this.props.router.query?.id;
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
    LoginHelper.gotoIndex();
  };

  // 点击粉丝列表
  goToFansList = () => {
    const id = this.props.router.query?.id;
    if (id) {
      Router.push({ url: `/my/fans?isOtherPerson=${this.props.isOtherPerson}&otherId=${id}` });
    } else {
      Router.push({ url: `/my/fans?isOtherPerson=${this.props.isOtherPerson}` });
    }
  };

  // 点击关注列表
  goToFollowsList = () => {
    const id = this.props.router.query?.id;
    if (id) {
      Router.push({ url: `/my/follows?isOtherPerson=${this.props.isOtherPerson}&otherId=${id}` });
    } else {
      Router.push({ url: `/my/follows?isOtherPerson=${this.props.isOtherPerson}` });
    }
  };

  // 点击编辑资料
  goToMyEditInfo = () => {
    Router.push({ url: 'my/edit' });
  };

  // 点击发送私信
  handleMessage = () => {
    const { targetUser } = this;
    const { id, nickname } = targetUser;
    Router.push({ url: `/message?page=chat&userId=${id}&nickname=${nickname}` });
  };

  gotoLikeList = () => {
    const isVisitOtherUser = this.props.router.query?.id;
    if (isVisitOtherUser) return;
    Router.push({ url: '/my/like' });
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

  // 点击头像预览
  handlePreviewAvatar = (e) => {
    e && e.stopPropagation();
    this.setState({
      isPreviewAvatar: !this.state.isPreviewAvatar,
    });
  };

  // 点击去到续费页面
  onRenewalFeeClick = () => {
    Router.push({
      url: '/my/renew',
    });
  };

  // 是否显示续费卡片
  whetherIsShowRenewalCard = () => !this.props.user?.isAdmini && !this.props.isOtherPerson;

  @computed get targetUser() {
    const { query } = this.props.router;

    if (query.id) {
      return this.props.user.targetUsers[query.id];
    }

    return {};
  }

  render() {
    const { site } = this.props;
    const { targetUser } = this;
    const user = this.props.router.query?.id ? targetUser || {} : this.props.user;
    const isHideLogout = site.platform === 'h5' && browser.env('weixin') && site.isOffiaccountOpen; // h5下非微信浏览器访问时，若用户已登陆，展示退出按钮
    return (
      <div className={styles.h5box}>
        {/* 上 */}
        <div className={styles.h5boxTop}>
          <div className={styles.headImgBox} onClick={this.handlePreviewAvatar}>
            <Avatar wrapClassName={styles.avatarWrap} image={user.avatarUrl} size="big" name={user.nickname} level={1} />
          </div>
          {/* 粉丝|关注|点赞 */}
          <div className={styles.userMessageList}>
            <div onClick={this.goToFansList} className={styles.userMessageListItem}>
              <span>粉丝</span>
              <span>{numberFormat(user.fansCount) || 0}</span>
            </div>
            <div onClick={this.goToFollowsList} className={styles.userMessageListItem}>
              <span>关注</span>
              <span>{numberFormat(user.followCount) || 0}</span>
            </div>
            <div onClick={this.gotoLikeList} className={styles.userMessageListItem}>
              <span>点赞</span>
              <span>{numberFormat(user.likedCount) || 0}</span>
            </div>
          </div>
        </div>
        {/* 中 用户昵称和他所在的用户组名称 */}
        <div>
          <div className={styles.userNameOrTeam}>
            <span className={styles.userNickname}>{user.nickname}</span>
            { user.group?.level > 0 ? (
              <div className={styles.memberBadge}>
                <MemberBadge
                  hasBg
                  groupLevel={user.group?.level}
                  groupName={user.group?.groupName}
                />
              </div>
            ) : (
              <span className={styles.groupName}>{user.group?.groupName}</span>
            )}
          </div>
          <p className={styles.text}>{user.signature || '这个人很懒，什么也没留下~'}</p>
        </div>
        {/* 下 */}
        <div className={styles.userBtn}>
          {this.props.isOtherPerson ? (
            <>
              <Button
                disabled={this.state.isFollowedLoading}
                onClick={() => {
                  this.handleChangeAttention(user.follow);
                }}
                type="primary"
                className={`${styles.btn} ${user.follow === 2 && styles.userFriendsBtn} ${
                  user.follow === 1 && styles.userFollowedBtn
                }`}
                full
              >
                <div className={styles.actionButtonContentWrapper}>
                  {this.state.isFollowedLoading ? (
                    <Spin size={16} type="spinner"></Spin>
                  ) : (
                    <Icon name={this.renderFollowedStatus(user.follow).icon} size={16} />
                  )}
                  <span className={styles.userBtnText}>{this.renderFollowedStatus(user.follow).text}</span>
                </div>
              </Button>
              <Button full className={styles.btn} onClick={this.handleMessage}>
                <div className={styles.actionButtonContentWrapper}>
                  <Icon name="NewsOutlined" size={16} />
                  <span className={styles.userBtnText}>发私信</span>
                </div>
              </Button>
            </>
          ) : (
            <>
              <Button full className={styles.btn} onClick={this.goToMyEditInfo} type="primary">
                <div className={styles.actionButtonContentWrapper}>
                  <Icon name="CompileOutlined" size={browser.env('ios') ? 14 : 16} />
                  <span className={styles.userBtnText}>编辑资料</span>
                </div>
              </Button>
              {isHideLogout ? (
                ''
              ) : (
                <Button full className={styles.btn} onClick={this.logout}>
                  <div className={styles.actionButtonContentWrapper}>
                    <Icon name="PoweroffOutlined" size={browser.env('ios') ? 14 : 16} />
                    <span className={styles.userBtnText}>退出登录</span>
                  </div>
                </Button>
              )}
            </>
          )}
        </div>
        {this.whetherIsShowRenewalCard() && <MemberShipCard router={this.props.router} onRenewalFeeClick={this.onRenewalFeeClick} />}
        {/* 右上角屏蔽按钮 */}
        {this.props.isOtherPerson && (
          <div
            onClick={() => {
              this.handleChangeShield(user.isDeny);
            }}
            className={styles.shieldBtn}
          >
            <Icon name="ShieldOutlined" size={14} />
            <span className={styles.shieldText}>{user.isDeny ? '解除屏蔽' : '屏蔽'}</span>
          </div>
        )}
        {user.originalAvatarUrl && this.state.isPreviewAvatar && (
          <ImagePreviewer
            visible={this.state.isPreviewAvatar}
            onClose={this.handlePreviewAvatar}
            imgUrls={[user.originalAvatarUrl]}
            currentUrl={user.originalAvatarUrl}
            onError={() => user.avatarUrl}
          />
        )}
      </div>
    );
  }
}

export default withRouter(index);
