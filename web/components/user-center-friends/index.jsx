import React from 'react';
import { Input, Icon, Button, Divider, Spin } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import Avatar from '@components/avatar';
import styles from './index.module.scss';
import throttle from '@common/utils/thottle.js';
import MemberBadge from '@components/member-badge';
@inject('site')
@inject('user')
@observer
class UserCenterFriends extends React.Component {
  static defaultProps = {
    id: null,
    imgUrl: '',
    type: 'follow',
    withHeaderUserInfo: false,
    nickName: null,
    userGroup: null,
    itemStyle: {},
    itemWrapperStyle: {},
    followHandler: async () => {},
    unFollowHandler: async () => {},
    onContainerClick: async ({ id }) => {},
    customActionArea: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      isFollowedLoading: false, // 是否点击关注
      isUnFollowedLoading: false, // 是否取消关注
    };
  }

  followUser = throttle(async ({ e, id }) => {
    e.stopPropagation();
    if (this.state.isFollowedLoading) return;
    this.setState({
      isFollowedLoading: true,
    });
    await this.props.followHandler({
      id,
    });
    this.setState({
      isFollowedLoading: false,
    });
  }, 200);

  unFollowUser = throttle(async ({ e, id }) => {
    e.stopPropagation();
    if (this.state.isUnFollowedLoading) return;
    this.setState({
      isUnFollowedLoading: true,
    });
    await this.props.unFollowHandler({
      id,
    });
    this.setState({
      isUnFollowedLoading: false,
    });
  }, 200);

  // 渲染操作区域
  renderActionArea() {
    if (this.props.id === this.props.user.id) return null;
    if (this.props.customActionArea) return this.props.customActionArea;
    const { isFollowedLoading, isUnFollowedLoading } = this.state;
    return (
      <div className={styles.friendAction} onClick={(e) => e.stopPropagation()}>
        {this.props.type === 'follow' && (
          <Button
            disabled={isFollowedLoading}
            type={'primary'}
            className={styles.friendActionFollow}
            onClick={async (e) => {
              e.stopPropagation();
              await this.followUser({ e, id: this.props.id });
            }}
          >
            {/* <span>+</span> */}
            {isFollowedLoading ? (
              <Spin size={12} type="spinner"></Spin>
            ) : (
              <Icon size={10} name={'PlusOutlined'} className={styles.iconScale} />
            )}
            <span>关注</span>
          </Button>
        )}

        {this.props.type === 'friend' && (
          <Button
            disabled={isUnFollowedLoading}
            type={'primary'}
            className={styles.friendActionFriend}
            onClick={async (e) => {
              e.stopPropagation();
              await this.unFollowUser({ e, id: this.props.id });
            }}
          >
            {isUnFollowedLoading ? (
              <Spin size={12} type="spinner"></Spin>
            ) : (
              <Icon size={10} name={'WithdrawOutlined'} className={styles.iconScale} />
            )}
            <span>互关</span>
          </Button>
        )}

        {this.props.type === 'followed' && (
          <Button
            disabled={isUnFollowedLoading}
            type={'primary'}
            className={styles.friendActionFollowed}
            onClick={async (e) => {
              e.stopPropagation();
              await this.unFollowUser({ e, id: this.props.id });
            }}
          >
            {isUnFollowedLoading ? (
              <Spin size={12} type="spinner"></Spin>
            ) : (
              <Icon size={10} name={'CheckOutlined'} className={styles.iconScale} />
            )}
            <span>已关注</span>
          </Button>
        )}
      </div>
    );
  }

  render() {
    const myid = this.props.user.id;
    const { isPC } = this.props.site;

    return (
      <div
        style={{
          ...this.props.itemWrapperStyle,
        }}
        onClick={async () => {
          await this.props.onContainerClick({
            id: this.props.id,
          });
        }}
      >
        <div
          style={{
            ...this.props.itemStyle,
          }}
          className={`${styles.friendItem} ${!isPC && styles.friendItemH5}`}
        >
          <div className={styles.friendInfo}>
            <div className={styles.friendAvatar}>
              <Avatar
                image={this.props.imgUrl}
                userId={this.props.id}
                isShowUserInfo={this.props.withHeaderUserInfo}
                circle
                name={this.props.nickName}
              />
            </div>
            <div className={styles.friendTextInfo}>
              <div className={styles.friendName}>
                <span title={this.props.nickName}>{this.props.nickName}</span>
              </div>
              <div className={styles.friendGroup}>
                {
                  this.props.groupLevel ?
                  <MemberBadge
                    groupLevel={this.props.groupLevel}
                    groupName={this.props.userGroup}
                  />
                  :
                  <span title={this.props.userGroup}>{this.props.userGroup}</span>
                }
              </div>
            </div>
          </div>
          {this.renderActionArea()}
        </div>
      </div>
    );
  }
}

export default UserCenterFriends;
