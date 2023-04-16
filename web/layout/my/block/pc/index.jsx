import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import styles from './index.module.scss';
import BaseLayout from '@components/base-layout';
import Copyright from '@components/copyright';
import ShieldList from './components/shield-list';
import UserCenterFansPc from '@components/user-center/fans-pc';
import UserCenterFollowsPc from '@components/user-center/follows-pc';
import SidebarPanel from '@components/sidebar-panel';

@inject('site')
@inject('user')
@observer
class BlockPcPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
    };
  }

  async componentDidMount() {
    this.props.router.events.on('routeChangeStart', this.beforeRouterChange);
    await this.props.user.getUserShieldList();

    this.setState({ isLoading: false });
  }

  componentWillUnmount() {
    this.props.router.events.off('routeChangeStart', this.beforeRouterChange);
  }

  redirectToSearchResultPost = () => {
    this.props.router.push(`/search/result-post?keyword=${this.state.value || ''}`);
  };


  beforeRouterChange = (url) => {
    // 如果不是进入 用户信息 详情页面
    if (!/user\/[0-9]{0,10}/.test(url)) {
      this.props.user.clearUserShield();
    }
  }

  // 点击屏蔽项去到他人页面
  handleItemClick = (item) => {
    this.props.router.push(`/user/${item.denyUserId}`);
  };

  // 加载更多函数
  loadMore = async () => {
    await this.props.user.getUserShieldList();
    return;
  };

  // 右侧 - 潮流话题 粉丝 版权信息
  renderRight = () => (
    <div className={`${styles.right} myblock`}>
      <UserCenterFansPc />
      <UserCenterFollowsPc />
      <Copyright />
    </div>
  );

  render() {
    const { isLoading } = this.state;
    const { user } = this.props;
    const { userShieldPage, userShieldTotalPage, userShield, userShieldTotalCount } = user;

    return (
      <BaseLayout
        name={'block'}
        right={this.renderRight}
        immediateCheck={false}
        onRefresh={this.loadMore}
        showRefresh={false}
        noMore={userShieldTotalPage < userShieldPage}
        rightClass={styles.rightSide}
        isShowLayoutRefresh={!!userShield?.length && !isLoading}
        className="myblock-page"
      >
        <SidebarPanel
          title="我的屏蔽"
          type='normal'
          isShowMore={false}
          noData={!userShield?.length}
          isLoading={isLoading}
          icon={{ type: 3, name: 'ScreenOutlined' }}
          rightText={`共有${userShieldTotalCount}位用户`}
        >
          <ShieldList data={userShield} onItemClick={this.handleItemClick} />
        </SidebarPanel>
      </BaseLayout>
    );
  }
}

export default withRouter(BlockPcPage);
