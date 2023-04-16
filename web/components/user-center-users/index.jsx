import React from 'react';
import UserCenterFriends from '../user-center-friends';
import { Spin } from '@discuzqsdk/design';
import styles from './index.module.scss';
import { createFollow, deleteFollow, getUserFans, readUsersList } from '@server';
import { get } from '@common/utils/get';
import deepClone from '@common/utils/deep-clone';
import NoData from '@components/no-data';

class UserCenterUsers extends React.Component {
  firstLoaded = false;
  containerRef = React.createRef(null);

  static defaultProps = {
    // 用户id，如果不传，则判断是未登录
    userId: null,
    // 加载数量限制
    limit: 1000,
    // 加载更多页面
    loadMorePage: true,
    splitElement: <div></div>,
    friends: [],
    isPc: false,
    onContainerClick: async ({ id }) => {},
    hasMorePage: false,
    className: '',
    styles: {},
    itemStyle: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      users: [],
    };
  }

  page = 1;
  totalPage = 1;

  fetchUsers = async () => {
    const opts = {
      params: {
        page: this.page,
        perPage: 20,
        filter: {
          hot: 0,
        },
      },
    };

    const usersRes = await readUsersList(opts);

    if (usersRes.code !== 0) {
      console.error(usersRes);
      return;
    }

    const pageData = get(usersRes, 'data.pageData', []);
    const totalPage = get(usersRes, 'data.totalPage', 1);

    this.totalPage = totalPage;

    const newUsers = this.state?.users?.concat(pageData);

    this.setState({
      users: newUsers,
    });

    if (this.page <= this.totalPage) {
      this.page += 1;
    }
  };

  setFansBeFollowed({ id, isMutual }) {
    const targetUsers = deepClone(this.state.users);
    targetUsers.forEach((user) => {
      if (user?.userId !== id) return;
      user.isMutual = isMutual;
      user.isFollow = !user.isFollow;
    });
    this.setState({
      users: targetUsers,
    });
  }

  setFansBeUnFollowed(id) {
    const targetUsers = deepClone(this.state.users);
    targetUsers.forEach((user) => {
      if (user?.userId !== id) return;
      user.isFollow = !user.isFollow;
    });
    this.setState({
      users: targetUsers,
    });
  }

  followUser = async ({ id: userId }) => {
    const res = await createFollow({ data: { toUserId: userId } });
    if (res.code === 0 && res.data) {
      this.setFansBeFollowed({
        id: userId,
        isMutual: res.data.isMutual,
      });
      return {
        msg: '操作成功',
        data: res.data,
        success: true,
      };
    }
    return {
      msg: res.msg,
      data: null,
      success: false,
    };
  };

  unFollowUser = async ({ id: userId }) => {
    const res = await deleteFollow({ data: { id: userId, type: 1 } });
    if (res.code === 0 && res.data) {
      this.setFansBeUnFollowed(userId);
      return {
        msg: '操作成功',
        data: res.data,
        success: true,
      };
    }
    return {
      msg: res.msg,
      data: null,
      success: false,
    };
  };

  async componentDidMount() {
    // 第一次加载完后，才允许加载更多页面
    await this.fetchUsers();
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
    const scrollDom = this.containerRef.current;
    if (scrollDom.clientHeight + scrollDom.scrollTop === scrollDom.scrollHeight) {
      if (!this.checkLoadCondition()) return;
      this.setState({
        loading: true,
      });
      await this.fetchUsers();
      this.setState({
        loading: false,
      });
    }
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
    const isNoData = this.state?.users?.length === 0 && !this.state.loading;
    return (
      <div
        className={this.props.className + ' user-center-users-list'}
        ref={this.containerRef}
        style={{
          width: '100%',
          height: '100%',
          overflowY: 'scroll',
          ...this.props.style,
        }}
      >
        {this.state?.users?.map((user, index) => {
          if (index + 1 > this.props.limit) return null;
          return (
            <div key={user.userId}>
              <UserCenterFriends
                id={user.userId}
                type={this.judgeFollowsStatus(user)}
                imgUrl={user.avatar}
                withHeaderUserInfo={this.props.isPc}
                onContainerClick={this.props.onContainerClick}
                nickName={user.nickname}
                userGroup={user.groupName}
                groupLevel={user.level}
                followHandler={this.followUser}
                itemStyle={this.props.itemStyle}
                unFollowHandler={this.unFollowUser}
              />
              {this.props.splitElement}
            </div>
          );
        })}
        {isNoData && <NoData />}
        <div className={styles.loadMoreContainer}>
          {this.state.loading
            && <div className={styles.spinner}>
                  <Spin type={'spinner'}>加载中 ...</Spin>
              </div>
          }</div>
      </div>
    );
  }
}

export default UserCenterUsers;
