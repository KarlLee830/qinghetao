/* eslint-disable spaced-comment */
import React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import styles from './index.module.scss';
import clearLoginStatus from '@common/utils/clear-login-status';
import UserCenterPost from '@components/user-center-post';
import UserCenterAction from '@components/user-center-action';
import SidebarPanel from '@components/sidebar-panel';
import Avatar from '@components/avatar';
import Copyright from '@components/copyright';
import Router from '@discuzqsdk/sdk/dist/router';
import UserCenterFansPc from '@components/user-center/fans-pc';
import UserCenterFollowsPc from '../../../components/user-center/follows-pc';
import BaseLayout from '@components/base-layout';
import { Toast } from '@discuzqsdk/design';
import { withRouter } from 'next/router';
import UserCenterHeaderPc from '@components/user-center/header-pc';
import MemberShipCard from '@components/member-ship-card';
import RenewalFee from '@components/user-center/renewal-fee';
import UserCenterThreads from '@components/user-center-threads';
import PacketOpen from '@components/red-packet-animation/web';

// 插件引入
/**DZQ->plugin->register<plugin_user@user_extension_left_layout_hook>**/

@inject('site')
@inject('user')
@inject('thread')
@inject('threadList')
@observer
class PCMyPage extends React.Component {
  constructor(props) {
    super(props);
    this.isUnmount = false;

    const myThreadsList = this.props.threadList.getList({
      namespace: 'my',
    });

    this.state = {
      showFansPopup: false, // 是否弹出粉丝框
      showFollowPopup: false, // 是否弹出关注框
      isLoading: false,
      isRenewalFeeVisible: false, // 是否弹出续费弹窗
    };

    if (myThreadsList.length === 0) {
      this.state.isLoading = true;
    }
  }

  beforeRouterChange = (url) => {
    if (url === '/my') {
      return;
    }
    // 如果不是进入 thread 详情页面
    if (!/thread\//.test(url)) {
      this.props.threadList.clearList({ namespace: 'my' });
    }
  };

  fetchUserThreads = async () => {
    try {
      const userThreadsList = await this.props.threadList.fetchList({
        namespace: 'my',
        filter: {
          toUserId: 0,
          complex: 5,
        },
      });
      if (!this.unMount) {
        this.props.threadList.setList({ namespace: 'my', data: userThreadsList });
      }
    } catch (err) {
      console.error(err);
      let errMessage = '加载用户列表失败';
      if (err.Code && err.Code !== 0) {
        errMessage = err.Msg;
      }

      Toast.error({
        content: errMessage,
        duration: 2000,
        hasMask: false,
      });
    }
  };

  async componentDidMount() {
    this.props.router.events.on('routeChangeStart', this.beforeRouterChange);

    await this.props.user.updateUserInfo(this.props.user.id);
    await this.fetchUserThreads();

    this.setState({ isLoading: false });
  }

  componentWillUnmount = () => {
    this.unMount = true;
    this.props.router.events.off('routeChangeStart', this.beforeRouterChange);
  };

  loginOut() {
    clearLoginStatus();
    window.location.replace('/');
  }

  // 点击粉丝更多
  moreFans = () => {
    this.setState({ showFansPopup: true });
  };
  // 点击粉丝关注更多
  moreFollow = () => {
    this.setState({ showFollowPopup: true });
  };

  onContainerClick = ({ id }) => {
    Router.push({ url: `/user/${id}` });
  };

  // 点击续费弹窗
  onRenewalFeeClick = () => {
    this.setState({
      isRenewalFeeVisible: true,
    });
  };

  // 关闭续费弹窗
  onRenewalFeeClose = () => {
    this.setState({
      isRenewalFeeVisible: false,
    });
  };

  // 是否显示续费卡片
  whetherIsShowRenewalCard = () => !this.props.user?.isAdmini;

  renderRight = () => {
    // 条件都满足时才显示微信
    const IS_WECHAT_ACCESSABLE = this.props.site.wechatEnv !== 'none' && !!this.props.user.wxNickname;
	const { site } = this.props;
    return (
      <>
		  {site.webConfig.setSite.siteUsergroup[0].value && (
			  <>
				{this.whetherIsShowRenewalCard() && (
				  <MemberShipCard
					shipCardClassName={styles.MemberShipCardWrapperPc}
					onRenewalFeeClick={this.onRenewalFeeClick}
				  />
				)}
			  </>
		  )}
        
        <SidebarPanel
          platform="h5"
          type="normal"
          title="个人资料"
          isShowMore={true}
          noData={false}
          moreText={'编辑资料'}
          onShowMore={() => {
            Router.push({ url: '/my/edit' });
          }}
          className={`${styles.borderRadius}`}
        >
          {this.props.site?.isSmsOpen && (
            <div className={styles.userInfoWrapper}>
              <div className={styles.userInfoKey}>手机号码</div>
              <div className={styles.userInfoValue}>{this.props.user.mobile || '未绑定'}</div>
            </div>
          )}

          {IS_WECHAT_ACCESSABLE && (
            <div className={styles.userInfoWrapper}>
              <div className={styles.userInfoKey}>微信</div>
              <div className={`${styles.userInfoValue} ${styles.wxContent}`}>
                <Avatar size="small" image={this.props.user.wxHeadImgUrl} name={this.props.user.wxNickname} />
                <span className={styles.wecahtNickname}>{this.props.user.wxNickname}</span>
              </div>
            </div>
          )}

          {/* <div className={styles.userInfoWrapper}>
            <div className={styles.userInfoKey}>实名认证</div>
            <div className={styles.userInfoValue}>去认证</div>
          </div> */}

          <div className={styles.userInfoWrapper}>
            <div className={styles.userInfoKey}>签名</div>
            <div className={styles.userInfoValue}>{this.props.user.signature || '这个人很懒，什么也没留下~'}</div>
          </div>
        </SidebarPanel>

        <UserCenterFansPc userId={this.props.user.id} />

        <UserCenterFollowsPc userId={this.props.user.id} />
        <Copyright />
      </>
    );
  };

  renderContent = () => {
    const { isLoading } = this.state;
    const { user, threadList } = this.props;
    const { lists } = threadList;

    const myThreadsList = threadList.getList({
      namespace: 'my',
    });

    const totalCount = threadList.getAttribute({
      namespace: 'my',
      key: 'totalCount',
    });

    let showUserThreadsTotalCount = true;

    if (totalCount === undefined || totalCount === null) {
      showUserThreadsTotalCount = false;
    }

    return (
      <div className={styles.userContent}>
        <div className={styles.section}>
          <UserCenterPost />
        </div>
        <div className={styles.section}>
          <UserCenterAction />
        </div>

        <div id="my-thread"></div>
        <SidebarPanel
          title="主题"
          type="normal"
          isShowMore={false}
          noData={!myThreadsList?.length}
          isLoading={isLoading}
          leftNum={showUserThreadsTotalCount ? `${totalCount}个主题` : ''}
          mold="plane"
        >
          <UserCenterThreads data={myThreadsList} threadClassName={styles.threadStyle}/>
        </SidebarPanel>
      </div>
    );
  };

  render() {
    const { isLoading } = this.state;
    const { thread, threadList } = this.props;
    const { lists } = threadList;
    const { hasRedPacket } = thread;

    const myThreadsList = threadList.getList({
      namespace: 'my',
    });

    const totalPage = threadList.getAttribute({
      namespace: 'my',
      key: 'totalPage',
    });

    const currentPage = threadList.getAttribute({
      namespace: 'my',
      key: 'currentPage',
    });

    const requestError = threadList.getListRequestError({ namespace: 'my' });

    // 判断用户信息loading状态
    const IS_USER_INFO_LOADING = !this.props.user?.username;
    // store中，userThreadsPage会比真实页数多1
    let currentPageNum = currentPage;
    if (totalPage > 1) {
      currentPageNum -= 1;
    }

    return (
      <>
        <BaseLayout
          showRefresh={false}
          onSearch={this.onSearch}
          // right={this.renderRight}
          immediateCheck={false}
          curr={'my'}
          pageName="my"
          noMore={totalPage <= currentPage}
          onRefresh={this.fetchUserThreads}
          isShowLayoutRefresh={!isLoading && !!myThreadsList?.length}
          showHeaderLoading={IS_USER_INFO_LOADING}
          bottomViewStyle={{ width: '68%' }}
        >
          <div>
            <div>
              <div className={styles.headerbox}>
                <div className={styles.userHeader}>
                  <UserCenterHeaderPc showHeaderLoading={IS_USER_INFO_LOADING} />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.userCenterBody}>
            <div className={classnames(styles.userCenterBodyItem, styles.userCenterBodyLeftItem)}>
              {this.renderContent()}
            </div>
            <div className={classnames(styles.userCenterBodyItem, styles.userCenterBodyRightItem)}>
              {this.renderRight()}
            </div>
          </div>
        </BaseLayout>
        <RenewalFee visible={this.state.isRenewalFeeVisible} onClose={this.onRenewalFeeClose} />
        {hasRedPacket > 0 && <PacketOpen onClose={() => thread.setRedPacket(0)} money={hasRedPacket} />}
      </>
    );
  }
}

export default withRouter(PCMyPage);
