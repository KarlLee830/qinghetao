import React from 'react';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Spin from '@discuzqsdk/design/dist/components/spin/index';
import { View } from '@tarojs/components';
import { inject, observer } from 'mobx-react';
import Avatar from '@components/avatar';
import styles from './index.module.scss';
import throttle from '@common/utils/thottle.js';
import MemberBadge from '@components/member-badge';

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
    groupLevel: null,
    itemStyle: {},
    itemWrapperStyle: {},
    followHandler: async () => {},
    unFollowHandler: async () => {},
    onContainerClick: async ({ id }) => {},
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
    setTimeout(() => {
      this.setState({
        isFollowedLoading: false,
      });
    }, 1000);
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
    setTimeout(() => {
      this.setState({
        isUnFollowedLoading: false,
      });
    }, 1000);
  }, 200);

  render() {
    const myid = this.props.user.id;
    const { isFollowedLoading, isUnFollowedLoading } = this.state;
    return (
      <View
        style={{
          ...this.props.itemWrapperStyle,
        }}
        onClick={async () => {
          await this.props.onContainerClick({
            id: this.props.id,
          });
        }}
      >
        <View
          style={{
            ...this.props.itemStyle,
          }}
          className={styles.friendItem}
        >
          <View className={styles.friendInfo}>
            <View className={styles.friendAvatar}>
              <Avatar
                image={this.props.imgUrl}
                userId={this.props.id}
                isShowUserInfo={this.props.withHeaderUserInfo}
                circle
                name={this.props.nickName}
              />
            </View>
            <View className={styles.friendTextInfo}>
              <View className={styles.friendName}>{this.props.nickName}</View>
              {
                this.props.groupLevel ?
                <MemberBadge
                  groupLevel={this.props.groupLevel}
                  groupName={this.props.userGroup}
                />
                :
                <View className={styles.friendGroup}>{this.props.userGroup}</View>
              }
            </View>
          </View>

          {this.props.id != myid && (
            <View className={styles.friendAction} onClick={(e) => e.stopPropagation()}>
              {this.props.type === 'follow' && (
                <Button
                  disabled={isFollowedLoading}
                  type={'primary'}
                  className={styles.friendActionFollow}
                  onClick={(e) => {
                    this.followUser({ e, id: this.props.id });
                  }}
                >
                  {isFollowedLoading ? (
                    <Spin size={12} type="spinner"></Spin>
                  ) : (
                    <Icon size={10} name={'PlusOutlined'} className={styles.iconScale} />
                  )}
                  <View>关注</View>
                </Button>
              )}

              {this.props.type === 'friend' && (
                <Button
                  type={'primary'}
                  disabled={isUnFollowedLoading}
                  className={styles.friendActionFriend}
                  onClick={(e) => {
                    this.unFollowUser({ e, id: this.props.id });
                  }}
                >
                  {isUnFollowedLoading ? (
                    <Spin size={12} type="spinner"></Spin>
                  ) : (
                    <Icon size={10} name={'WithdrawOutlined'} className={styles.iconScale} />
                  )}
                  <View>互关</View>
                </Button>
              )}

              {this.props.type === 'followed' && (
                <Button
                  type={'primary'}
                  disabled={isUnFollowedLoading}
                  className={styles.friendActionFollowed}
                  onClick={(e) => {
                    this.unFollowUser({ e, id: this.props.id });
                  }}
                >
                  {isUnFollowedLoading ? (
                    <Spin size={12} type="spinner"></Spin>
                  ) : (
                    <Icon size={10} name={'CheckOutlined'} className={styles.iconScale} />
                  )}
                  <View>已关注</View>
                </Button>
              )}
            </View>
          )}
        </View>
      </View>
    );
  }
}

export default UserCenterFriends;
