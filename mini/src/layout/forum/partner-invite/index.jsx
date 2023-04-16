import React from 'react';
import { inject, observer } from 'mobx-react';
import HomeHeader from '@components/home-header';
import List from '@components/list';
import { View, Button } from '@tarojs/components';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Avatar from '@discuzqsdk/design/dist/components/avatar/index';
import Spin from '@discuzqsdk/design/dist/components/spin/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import NoData from '@components/no-data';
import SectionTitle from '@components/section-title';
import { get } from '@common/utils/get';
import ActiveUsers from '../../search/components/active-users';
import PopularContents from '../../search/components/popular-contents';
import layout from './index.module.scss';
import SiteInfo from '../site-info';
import PayBox from '@components/payBox';
import { simpleRequest } from '@common/utils/simple-request';
import Taro, { getCurrentInstance } from '@tarojs/taro';
import { readUser } from '@server';
import LoginHelper from '@common/utils/login-helper';

const MAX_THREAD_COUNT = 10

@inject('site')
@inject('index')
@inject('forum')
@inject('search')
@inject('user')
@inject('invite')
@observer
class PartnerInviteH5Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      invitorName: '',
      invitorAvatar: '/dzq-img/login-user.png',
      isHot: false,
      isRenew: !!this.props.user?.userInfo?.isRenew, // 是否续费
    };
  }

  setNavigationBarStyle = () => {
    Taro.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#ffffff'
    })
  }

  async componentDidMount() {
    this.setNavigationBarStyle();

    try {
      await Promise.all([
        this.initInviteCode(),
        this.initUserList(),
        this.initThreadList()
      ]);
    } catch (e) {
      Toast.error({
        content: e?.Message || e,
        hasMask: false,
        duration: 1000,
      });
    }

    const { forum } = this.props;
    forum.setIsLoading(false);
  }

  async initInviteCode() {
    const { invite } = this.props;
    let { inviteCode } = getCurrentInstance().router.params;
    inviteCode = inviteCode || this.props.invite.getInviteCode()

    if (inviteCode) {
      invite.setInviteCode(inviteCode);
      const inviteResp = await readUser({
        params: {
          userId: inviteCode.length === 32 ? 1 : inviteCode,
        },
      });

      const nickname = get(inviteResp, 'data.nickname', '');
      const avatar = get(inviteResp, 'data.avatarUrl', '');

      this.setState({
        invitorName: inviteCode.length === 32 ? '站长' : nickname,
        invitorAvatar: avatar,
      });
    }
  }

  async initUserList() {
    const { forum } = this.props;
    const usersList = await simpleRequest('readUsersList', {
      params: {
        filter: {
          hot: 1,
        },
      },
    });

    forum.setUsersPageData(usersList);
  }

  async initThreadList() {
    const { forum, search } = this.props;

    const INVITE_THREADLIST_SCOPE = 3;
    const threadList = await search.getThreadList({
      scope: INVITE_THREADLIST_SCOPE,
    });

     forum.setThreadsPageData(threadList);

    // 推荐内容数量大于0则title为精彩内容预览，否则为热门内容预览
    const isHot = !threadList?.pageData?.some(item => item.isSite);
    this.setState({
      isHot,
    });
  }

  handleJoinSite = () => {
    const { user, site } = this.props;
    if (!user?.isLogin()) {
      LoginHelper.saveAndLogin();
      return false;
    }

    const { setSite: { siteMode, sitePrice, siteName } = {} } = site.webConfig;
    if (siteMode === 'pay' && user.paid === false) {
      PayBox.createPayBox({
        data: {
          // data 中传递后台参数
          amount: sitePrice,
          title: siteName,
          type: this.state.isRenew ? 8 : 1 // 续费传8，新付费传1.站点付费注册
        },
        isAnonymous: false, // 是否匿名
        success: async () => {
          await user.updateUserInfo(user.id);
          await site.getSiteInfo();
          // page组件做了跳转拦截。此处需要先判断一下当前是否仍滞留付费页，如果非滞留，则恢复登录前页面
          const path = getCurrentInstance().router.path;
          if (path === '/subPages/forum/partner-invite/index') {
            LoginHelper.restore();
          }
        }, // 支付成功回调
        completed: (orderInfo) => {}, // 支付完成回调(成功或失败)
      });
      return false;
    }
    LoginHelper.restore();
  };

  render() {
    const { site, forum, invite, user } = this.props;
    const { inviteCode } = invite;
    const { webConfig } = site;
    const { setSite: { siteMode, siteExpire, sitePrice, siteMasterScale } = {} } = webConfig;
    const { usersPageData = [], threadsPageData = [], isLoading } = forum;
    const { invitorName, invitorAvatar, isHot, isRenew } = this.state;

    const icon = { type: 3, name: isHot ? 'HotOutlined' : 'WonderfulOutlined' };
    const title = `${isHot ? '热门' : '精彩'}内容预览`

    return (
      <List className={layout.page} allowRefresh={false}>
        <HomeHeader hideInfo hideMinibar mode="join" />
        <View className={layout.content}>
          {/* 站点信息 start */}
          <SiteInfo />
          {/* 站点信息 end */}
          {/* 站点用户 start */}
          <View className={layout.users}>
            <SectionTitle
              isShowMore={false}
              icon={{ type: 2, name: 'MemberOutlined' }}
              title="活跃用户"
              onShowMore={this.handleJoinSite}
            />
            {!isLoading && usersPageData?.length ? (
              <ActiveUsers data={usersPageData} onItemClick={this.handleJoinSite} />
            ) : (
              <></>
            )}
            {!isLoading && !usersPageData?.length ? <NoData /> : <></>}
            {isLoading ? (
              <View className={layout.spinner}>
                <Spin type="spinner" />
              </View>
            ) : (
              <></>
            )}
          </View>
          {/* 站点用户 end */}
          {/* 热门内容预览 start */}
          <View className={layout.hot}>
            <SectionTitle
              isShowMore={false}
              icon={icon}
              title={title}
              onShowMore={this.handleJoinSite}
            />
            {!isLoading && threadsPageData?.length ? (
              <PopularContents data={threadsPageData} onTextItemClick={this.handleJoinSite} unifyOnClick={this.handleJoinSite} />
            ) : (
              <></>
            )}
            {!isLoading && !threadsPageData?.length ? <NoData /> : <></>}
            {isLoading ? (
              <View className={layout.spinner}>
                <Spin type="spinner" />
              </View>
            ) : (
              <></>
            )}
          </View>
          {/* 热门内容预览 end */}
          <View className={layout.bottom}>
            {inviteCode ? (
              <View className={layout.bottom_tips}>
                {/* <img className={layout.bottom_tips_img} src={ invitorAvatar } alt={invitorAvatar}/> */}
                <Avatar
                  size="small"
                  text={invitorName?.substring(0, 1)}
                  className={layout.bottom_tips_img}
                  image={invitorAvatar}
                  onClick={this.handleJoinSite}
                />
                <View className={layout.bottom_tips_text}>
                  <View>{invitorName} 邀请您加入站点</View>
                  {/* {siteMode === 'pay' ? (<View>，可获得返现 ¥{(((10 - siteMasterScale) * sitePrice) / 10).toFixed(2)}</View>) : ('')} */}
                </View>
                <View className={layout.bottom_tips_arrows}></View>
              </View>
            ) : (
              <></>
            )}

            <View className={layout.bottom_button_wrap}>
              {siteMode === 'pay' ? (
                <View className={layout.bottom_title}>
                  { user.isLogin() ? <></> : <View>新用户加入 <View className={layout.tips}>¥{sitePrice}</View></View> }
                  <View className={!user.isLogin() ? layout.expire : ''}>有效期{ user.isLogin() ? '：' : ' '}<View className={layout.tips}>{siteExpire ? `${siteExpire}天` : '永久'}</View></View>
                </View>
              ) :
                <></>
              }
              <Button className={layout.bottom_button} onClick={this.handleJoinSite}>
                { user.isLogin() ? `${siteMode === 'pay' ? `¥${sitePrice} ` : ''}${this.state.isRenew ? '续费' : '立即'}加入` : '登录浏览更多内容'}
              </Button>
            </View>
          </View>
        </View>
      </List>
    );
  }
}

export default PartnerInviteH5Page;
