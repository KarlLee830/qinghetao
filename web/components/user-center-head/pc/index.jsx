import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { computed } from 'mobx';
import styles from './index.module.scss';
import Avatar from '@components/avatar';
import { Button, Icon, Toast, Spin } from '@discuzqsdk/design';
import { ACCEPT_IMAGE_TYPES } from '@common/constants/thread-post';
import Router from '@discuzqsdk/sdk/dist/router';
import { withRouter } from 'next/router';
import { fixImageOrientation } from '@common/utils/exif';
import throttle from '@common/utils/thottle.js';
import { updateMyThreadAvatar } from '@common/store/thread-list/list-business';
import MemberBadge from '@components/member-badge';

@inject('user')
@inject('threadList')
@observer
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isUploadAvatarUrl: false, // 是否上传头像
      isFollowedLoading: false, // 是否点击关注
    };
  }

  static defaultProps = {
    isOtherPerson: false, // 表示是否是其他人
  };

  avatarUploaderRef = React.createRef(null);
  backgroundUploaderRef = React.createRef(null);

  handleAvatarUpload = () => {
    this.avatarUploaderRef.current.click();
  };

  onAvatarChange = async (fileList) => {
    if (!fileList.target.files[0]) return;
    this.setState({
      isUploadAvatarUrl: true,
    });
    const fixedImg = await fixImageOrientation(fileList.target.files[0]);
    this.props.user
      .updateAvatar(fixedImg)
      .then((res) => {
        const { id } = this.props.user;
        if (id === res.id && res.avatarUrl) {
          // this.user.editAvatarUrl = res.avatarUrl;
          updateMyThreadAvatar({
            avatarUrl: res.avatarUrl,
            threadList: this.props.threadList,
          });

          Toast.success({
            content: '上传头像成功',
            hasMask: false,
            duration: 2000,
          });
          this.setState({
            isUploadAvatarUrl: false,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        Toast.error({
          content: err.Msg || '上传头像失败',
          hasMask: false,
          duration: 2000,
        });
        this.setState({
          isUploadAvatarUrl: false,
        });
        // 上传失败 应该取之前用户的头像
        // this.user.editAvatarUrl = this.user.avatarUrl;
      });
  };

  handleBackgroundUpload = async () => {
    this.backgroundUploaderRef.current.click();
  };

  onBackgroundChange = async (fileList) => {
    if (!fileList.target.files[0]) return;
    this.props.handleSetBgLoadingStatus(true);
    const fixedImg = await fixImageOrientation(fileList.target.files[0]);
    this.props.user
      .updateBackground(fixedImg)
      .then((res) => {
        const { id } = this.props.user;
        if (id === res.id && res.backgroundUrl) {
          Toast.success({
            content: '上传成功',
            hasMask: false,
            duration: 2000,
          });
          this.props.handleSetBgLoadingStatus(false);
        }
      })
      .catch((err) => {
        Toast.error({
          content: err.Msg || '上传背景图失败',
          hasMask: false,
          duration: 2000,
        });
        this.props.handleSetBgLoadingStatus(false);
      })
      .finally(() => {
        this.backgroundUploaderRef.current.value = '';
      });
  };

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

  // 点击屏蔽
  handleChangeShield = throttle(async (isDeny) => {
    const { query } = this.props.router;
    try {
      if (isDeny) {
        await this.props.user.undenyUser(query.id);
        this.props.user.setTargetUserNotBeDenied({ userId: query.id });
        Toast.success({
          content: '解除屏蔽成功',
          hasMask: false,
          duration: 2000,
        });
      } else {
        await this.props.user.denyUser(query.id);
        this.props.user.setTargetUserDenied({ userId: query.id });
        Toast.success({
          content: '屏蔽成功',
          hasMask: false,
          duration: 2000,
        });
      }
    } catch (err) {
      console.error(err);
      if (err.Code) {
        Toast.error({
          content: err.Msg,
          duration: 2000,
          hasMask: false,
        });
      }
    }
  }, 1000);

  @computed get targetUser() {
    const { query } = this.props.router;

    if (query.id) {
      return this.props.user.targetUsers[query.id];
    }

    return {};
  }

  // 点击发送私信
  handleMessage = () => {
    const { id, nickname } = this.targetUser;
    Router.push({ url: `/message?page=chat&userId=${id}&nickname=${nickname}` });
  };

  render() {
    const { targetUsers } = this.props.user;
    const user = this.props.router.query?.id ? targetUsers[this.props.router.query?.id] || {} : this.props.user;
    const { isUploadAvatarUrl } = this.state;

    return (
      <div className={styles.box}>
        <div className={styles.boxTop}>
          <div className={styles.headImgBox}>
            <Avatar wrapClassName={styles.avatarWrap} image={user.avatarUrl} size="big" name={user.nickname} level={2} />
            {/* 相机图标 */}
            {!this.props.router.query?.id && (
              <div className={styles.userCenterEditCameraIcon} onClick={this.handleAvatarUpload}>
                <Icon name="CameraOutlined" />
                <input
                  onChange={this.onAvatarChange}
                  ref={this.avatarUploaderRef}
                  type="file"
                  style={{ display: 'none' }}
                  multiple={false}
                  accept={ACCEPT_IMAGE_TYPES.join(',')}
                />
              </div>
            )}
            {isUploadAvatarUrl && (
              <div className={styles.uploadAvatar}>
                <Icon name="UploadingOutlined" size={12} />
                <span className={styles.uploadText}>上传中...</span>
              </div>
            )}
          </div>
          <div className={styles.contentBox}>
            {/* 用户昵称和他所在的用户组名称 */}
            <div className={styles.userNameOrTeam}>
              <div className={styles.username}>{user.nickname}</div>
              { user.group?.level > 0 ? (
                <div className={styles.memberBadge}>
                  <MemberBadge
                    hasBg
                    groupLevel={user.group?.level}
                    groupName={user.group?.groupName}
                  />
                </div>
              ) : (
                <div className={styles.groupName}>{user.group?.groupName}</div>
              )}
              <p
                title={user.signature || '这个人很懒，什么也没留下~'}
                className={`${styles.text} ${this.props.router.query?.id && styles.otherText}`}
              >
                {user.signature || '这个人很懒，什么也没留下~'}
              </p>
            </div>
            {this.props.router.query?.id ? (
              <div className={styles.otherUserBtn}>
                <div
                  onClick={() => {
                    this.handleChangeShield(user.isDeny);
                  }}
                  className={styles.shieldBtn}
                >
                  <Icon name="ShieldOutlined" size={14} />
                  <span className={styles.shieldText}>{user.isDeny ? '解除屏蔽' : '屏蔽'}</span>
                </div>
                <div className={styles.userBtn}>
                  <Button
                    onClick={() => {
                      this.handleChangeAttention(user.follow);
                    }}
                    type="primary"
                    className={`${styles.btn} ${user.follow === 2 && styles.userFriendsBtn} ${
                      user.follow === 1 && styles.userFollowedBtn
                    }`}
                    disabled={this.state.isFollowedLoading}
                  >
                    {this.state.isFollowedLoading ? (
                      <Spin size={14} type="spinner"></Spin>
                    ) : (
                      <Icon name={this.renderFollowedStatus(user.follow || 0).icon} size={12} />
                    )}
                    <span className={styles.userBtnText}>{this.renderFollowedStatus(user.follow || 0).text}</span>
                  </Button>
                  <Button className={styles.btn} onClick={this.handleMessage}>
                    <Icon name="NewsOutlined" size={12} />
                    <span className={styles.userBtnText}>发私信</span>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.upload} onClick={this.handleBackgroundUpload}>
                  <input
                    onChange={this.onBackgroundChange}
                    ref={this.backgroundUploaderRef}
                    type="file"
                    style={{ display: 'none' }}
                  />
                  <div className={styles.uploadText}>
                    <Icon name="UploadingOutlined" size={12} className={styles.uploadIcon} />
                    上传封面图片
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(index);
