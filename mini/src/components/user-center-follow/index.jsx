import React from 'react';
import { inject, observer } from 'mobx-react';
import Spin from '@discuzqsdk/design/dist/components/spin/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import { createFollow, deleteFollow, getUserFollow } from '@server';
import { get } from '@common/utils/get';
import deepClone from '@common/utils/deep-clone';
import NoData from '@components/no-data';
import { View } from '@tarojs/components';
import List from '@components/list';

import UserCenterFriends from '../user-center-friends';
import styles from './index.module.scss';
import { followerAdapter } from './adapter';
import throttle from '@common/utils/thottle.js';

@inject('user')
@observer
class UserCenterFollows extends React.Component {
  firstLoaded = false;
  containerRef = React.createRef(null);

  static defaultProps = {
    // 用户id，如果不传，认为是自己的粉丝
    userId: null,
    // 加载数量限制
    limit: 1000,
    // 加载更多页面
    loadMorePage: true,
    splitElement: <View></View>,
    isPc: false,
    dataSource: null,
    setDataSource: null,
    sourcePage: null,
    sourceTotalPage: null,
    updateSourcePage: null,
    updateSourceTotalPage: null,
    friends: [],
    loadMoreAction: async () => {},
    followHandler: async () => {},
    unFollowHandler: async () => {},
    onContainerClick: async ({ id }) => {},
    hasMorePage: false,
    className: '',
    style: {},
    itemStyle: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      follows: {},
      height: '100vh',
    };
  }

  page = 1;
  totalPage = 1;

  fetchFollows = async () => {
    try {
      const followRes = await this.props.user.getUserFollowers({
        userId: this.props.userId || this.props.user.id,
        page: this.page,
        searchValue: this.state.searchValue,
      });

      if (followRes.code !== 0) {
        console.error(followRes);
        Toast.error({
          content: followRes.msg,
          duration: 2000,
        });
        return;
      }

      this.props.user.setUserFollowers({
        userId: this.props.userId || this.props.user.id,
        page: this.page,
        followersData: followRes,
      });

      const totalPage = get(followRes, 'data.totalPage', 1);

      this.totalPage = totalPage;

      if (this.page <= this.totalPage) {
        this.page += 1;
      }
    } catch (error) {
      console.error(error);
      if (error.code) {
        Toast.error({
          content: error.msg,
          duration: 2000,
        });
      }
    }
  };

  followUser = async ({ id: userId }) => {
    try {
      const res = await createFollow({ data: { toUserId: userId } });
      if (res.code === 0 && res.data) {
        Toast.success({
          content: '操作成功',
          hasMask: false,
          duration: 2000,
        });
        this.props.user.followUser({ userId, followRes: res });
        return {
          msg: '操作成功',
          data: res.data,
          success: true,
        };
      }
      Toast.error({
        content: res.msg || '关注失败',
        hasMask: false,
        duration: 2000,
      });

      return {
        msg: res.msg,
        data: null,
        success: false,
      };
    } catch (error) {
      console.error(error);
      Toast.error({
        content: '网络错误',
        duration: 2000,
      });
    }
  };

  unFollowUser = async ({ id }) => {
    try {
      const res = await deleteFollow({ data: { id, type: 1 } });
      if (res.code === 0 && res.data) {
        Toast.success({
          content: '操作成功',
          hasMask: false,
          duration: 2000,
        });
        this.props.user.unFollowUser({ userId: id });
        return {
          msg: '操作成功',
          data: res.data,
          success: true,
        };
      }

      Toast.error({
        content: res.msg || '取消关注失败',
        hasMask: false,
        duration: 2000,
      });

      return {
        msg: res.msg,
        data: null,
        success: false,
      };
    } catch (error) {
      console.error(error);
      Toast.error({
        content: '网络错误',
        duration: 2000,
      });
    }
  };

  async componentDidMount() {
    // 第一次加载完后，才允许加载更多页面
    await this.fetchFollows();
    this.firstLoaded = true;
    this.setState({
      loading: false,
    });
    if (!this.containerRef.current) return;
    this.containerRef.current.addEventListener('scroll', this.loadMore);
  }

  // 清理，防止内存泄露
  componentWillUnmount() {
    if (!this.containerRef.current) return;
    this.containerRef.current.removeEventListener('scroll', this.loadMore);
  }

  // TODO: 增加这里对于 ID 的处理，感应 ID 变化时发生及时更新
  async componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.page = 1;
      this.totalPage = 1;
      await this.loadMore();
    }
  }

  // 检查是否满足触底加载更多的条件
  checkLoadCondition() {
    const hasMorePage = this.totalPage >= this.page;
    if (this.state.loading) return false;
    if (!this.props.loadMorePage) {
      return false;
    }
    if (!hasMorePage) return false;

    return true;
  }

  // 加载更多函数
  loadMore = async () => {
    await this.fetchFollows();
    return;
  };

  // 判断关注状态
  judgeFollowsStatus = (user) => {
    if (!user.isFollow) {
      return 'follow';
    }
    if (user.isMutual) {
      return 'friend';
    }
    if (user.isFollow) {
      return 'followed';
    }
  };

  render() {
    const dataSource = followerAdapter(this.props.user.followStore[this.props.userId || this.props.user.id]?.data || {});

    return (
      <View>
        <List
          onRefresh={this.loadMore}
          noMore={this.totalPage < this.page}
          hasOnScrollToLower={true}
          height={this.state.height}
          className={styles.userCenterFriends}
        >
          <View className={styles.followBody}>
            {dataSource.map((user, index) => {
              if (index + 1 > this.props.limit) return null;
              return (
                <View key={user.id}>
                  <UserCenterFriends
                    id={user.id}
                    type={this.judgeFollowsStatus(user)}
                    imgUrl={user.avatar}
                    withHeaderUserInfo={this.props.isPc}
                    onContainerClick={this.props.onContainerClick}
                    nickName={user.nickName}
                    userGroup={user.groupName}
                    groupLevel={user.level}
                    followHandler={this.followUser}
                    unFollowHandler={this.unFollowUser}
                    itemStyle={this.props.itemStyle}
                  />
                  {this.props.splitElement}
                </View>
              );
            })}
          </View>
        </List>
      </View>
    );
  }
}

export default UserCenterFollows;
