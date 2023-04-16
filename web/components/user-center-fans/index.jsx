import React from 'react';
import UserCenterFriends from '../user-center-friends';
import { Spin, Toast } from '@discuzqsdk/design';
import { followerAdapter } from './adapter';
import friendsStyle from '@components/user-center/friend-pc/index.module.scss';
import styles from './index.module.scss';
import { createFollow, deleteFollow, getUserFans } from '@server';
import { get } from '@common/utils/get';
import deepClone from '@common/utils/deep-clone';
import NoData from '@components/no-data';
import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import Avatar from '@components/avatar';
import throttle from '@common/utils/thottle.js';

@inject('user')
@observer
class UserCenterFans extends React.Component {
  firstLoaded = false;
  containerRef = React.createRef(null);

  static defaultProps = {
    // 用户id，如果不传，认为是自己的粉丝
    userId: null,
    // 加载数量限制
    limit: 1000,
    // 加载更多页面
    loadMorePage: true,
    splitElement: <div></div>,
    friends: [],
    isPc: false,
    dataSource: null,
    setDataSource: null,
    sourcePage: null,
    sourceTotalPage: null,
    updateSourcePage: null,
    updateSourceTotalPage: null,
    loadMoreAction: async () => {},
    followHandler: async () => {},
    unFollowHandler: async () => {},
    onContainerClick: async ({ id }) => {},
    hasMorePage: false,
    className: '',
    styles: {},
    itemStyle: {},
    loadingElementClass: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      fans: {},
    };
  }

  page = 1;
  totalPage = 1;

  fetchFans = async () => {
    const fansRes = await this.props.user.getUserFanses({
      userId: this.props.userId || this.props.user.id,
      page: this.page,
    });

    if (fansRes.code !== 0) {
      console.error(fansRes);
      Toast.error({
        content: fansRes.msg,
        duration: 2000,
      });
      return;
    }

    const totalPage = get(fansRes, 'data.totalPage', 1);

    this.totalPage = totalPage;

    this.props.user.setUserFanses({
      userId: this.props.userId || this.props.user.id,
      page: this.page,
      fansData: fansRes,
    });

    if (this.page <= this.totalPage) {
      this.page += 1;
    }
  };

  followUser = async ({ id: userId }) => {
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
  };

  unFollowUser = async ({ id }) => {
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
  };

  async componentDidMount() {
    // 第一次加载完后，才允许加载更多页面
    await this.fetchFans();
    this.firstLoaded = true;
    this.setState({
      loading: false,
    });
    if (!this.containerRef.current) return;
    this.containerRef.current.addEventListener('scroll', this.loadMore);
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.page = 1;
      this.totalPage = 1;
      await this.loadMore();
    }
  }

  // 清理，防止内存泄露
  componentWillUnmount() {
    if (!this.containerRef.current) return;
    this.containerRef &&
      this.containerRef.current &&
      this.containerRef.current.removeEventListener('scroll', this.loadMore);
  }

  // 检查是否满足触底加载更多的条件
  checkLoadCondition() {
    let hasMorePage = null;
    if (this.dataSource) {
      hasMorePage = this.sourceTotalPage >= this.sourcePage;
    } else {
      hasMorePage = this.totalPage >= this.page;
    }
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
      await this.fetchFans();
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
    const dataSource = followerAdapter(this.props.user.fansStore[this.props.userId || this.props.user.id]?.data || {});
    const isNoData = dataSource.length === 0 && !this.state.loading;

    return (
      <div
        className={`${this.props.className} user-center-friends`}
        ref={this.containerRef}
        style={{
          width: '100%',
          height: '100%',
          overflowY: 'scroll',
          ...this.props.styles,
        }}
      >
        {dataSource.map((user, index) => {
          if (index + 1 > this.props.limit) return null;
          return (
            <div key={user.id} className="user-center-friends-item">
              <UserCenterFriends
                id={user.id}
                type={this.judgeFollowsStatus(user)}
                imgUrl={user.avatar}
                withHeaderUserInfo={this.props.isPc}
                onContainerClick={() => this.props.onContainerClick({id: user.id})}
                nickName={user.nickName}
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
        <div
          className={`${friendsStyle.friendWrap} ${styles.friendWrap} ${styles['display-none']} user-center-friends-mini`}
        >
          {dataSource.map((user, index) => {
            if (index + 1 > this.props.limit) return null;
            return (
              <div
                key={user.id + index}
                className={friendsStyle.friendItem}
                onClick={async () => {
                  await this.props.onContainerClick({
                    id: user.id,
                  });
                }}
              >
                <div className={friendsStyle.friendAvatar}>
                  <Avatar image={user.avatar} userId={user.id} circle name={user.nickName} />
                </div>
                <div className={friendsStyle.friendTextInfo}>{user.nickName}</div>
              </div>
            );
          })}
        </div>
        {isNoData && <NoData />}
        {this.state.loading && (
          <div className={classnames(styles.loadMoreContainer, this.props.loadingElementClass)}>
            <Spin type={'spinner'}>加载中 ...</Spin>
          </div>
        )}
      </div>
    );
  }
}

export default UserCenterFans;
