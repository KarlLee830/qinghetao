import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import { Button, Toast, Avatar, Icon } from '@discuzqsdk/design';
import { get } from '@common/utils/get';
import SiteInfo from './site-info';
import { readUser } from '@server';
import PayBox from '@components/payBox';
import { numberFormat } from '@common/utils/number-format';
import PartnerInviteWrap from './partner-invite-wrap';
import Copyright from '@components/copyright';
import PartnerInviteHot from './partner-invite-hot';
import PartnerInviteUser from './partner-invite-user';
import pclayout from './pc.module.scss';
import mlayout from './index.module.scss';
import browser from '@common/utils/browser';
import clearLoginStatus from '@common/utils/clear-login-status';
import LoginHelper from '@common/utils/login-helper';

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
      isRenew: !!this.props.user?.userInfo?.isRenew, // 是否属于续费加入
    };
  }
  async componentDidMount() {
    const { forum, router, invite } = this.props;
    try {
      const inviteCode = invite.getInviteCode(router);
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

      forum.setIsLoading(false);
    } catch (e) {
      Toast.error({
        content: e?.Message || e,
        hasMask: false,
        duration: 1000,
      });
    }
  }

  handleJoinSite = async () => {
    const { user, site, router } = this.props;
    if (!user?.isLogin()) {
      LoginHelper.saveAndLogin();
      return false;
    }
    const { setSite: { siteMode, sitePrice, siteName } = {} } = site.webConfig;
    if (siteMode === 'pay' && user.paid === false) {
      PayBox.createPayBox({
        data: {      // data 中传递后台参数
          amount: sitePrice,
          title: siteName,
          type: this.state.isRenew ? 8 : 1 // 续费传8，新付费传1.站点付费注册
        },
        isAnonymous: false, // 是否匿名
        success: async () => {
          await user.updateUserInfo(user.id);
          await site.getSiteInfo();
          // 支付完成并更新状态数据后，HocWithNoPaid组件会自动将页面导向主页
        }, // 支付成功回调
        completed: (orderInfo) => {
        }, // 支付完成回调(成功或失败)
      });
    } else {
      LoginHelper.restore();
    }
    return false;
  }

  logout = () => {
    clearLoginStatus();
    this.props.user.removeUserInfo();
    this.props.site.webConfig.user = null;
    LoginHelper.gotoLogin();
  }

  // 右侧 - 潮流话题 粉丝 版权信息
  renderRight = () => {
    const { site: { platform, webConfig = {} }, forum, user } = this.props;
    const { invitorName, invitorAvatar, isRenew } = this.state;
    const { setSite: { siteMode, sitePrice, siteMasterScale, siteExpire } = {} } = webConfig;
    const layout = platform === 'h5' ? mlayout : pclayout;
    const { inviteCode } = this.props.router.query;
    // 内容数
    const countThreads = get(webConfig, 'other.countThreads', '');
    if (platform === 'h5') {
      return <></>;
    }
    const username = get(webConfig, 'setSite.siteAuthor.username', '');
    const avatar = get(webConfig, 'setSite.siteAuthor.avatar', '');

    // 站点介绍
    return (
      <>
        <div className={layout.user_card_wrap}>
          <div className={layout.user_card_main}>
            <div className={layout.user_card_avatar}>
              <Avatar
                size={'big'}
                image={avatar}
                text={username && username.substring(0, 1)}
              />
            </div>
            <div className={layout.user_card_info}>
              <div className={layout.user_info_name}>{username}</div>
              <div className={layout.user_info_tag}>站长</div>
              <div className={layout.site_info}>
                <div className={layout.site_status_list}>
                    <span className={layout.site_status_label}>更新</span>
                    <span
                      className={layout.site_status_item}
                      // title={(updataTime && getSiteUpdateTime(updataTime)) || '--'}
                    >
                      {/* TODO：和产品确认，暂时写死 */}
                      刚刚
                      {/* {(updataTime && getSiteUpdateTime(updataTime)) || '--'} */}
                    </span>
                </div>
                <div className={layout.site_status_list}>
                    <span className={layout.site_status_label}>成员</span>
                    <span
                      className={layout.site_status_item}
                      title={numberFormat(webConfig?.other?.countUsers) || '--'}
                    >
                      {numberFormat(webConfig?.other?.countUsers) || '--'}
                    </span>
                </div>
                <div className={layout.site_status_list}>
                    <span className={layout.site_status_label}>主题</span>
                    <span
                      className={layout.site_status_item}
                      title={numberFormat(countThreads) || '--'}
                    >
                      {numberFormat(countThreads) || '--'}
                    </span>
                </div>
              </div>
            </div>
          </div>
          {
            inviteCode
              ? <div className={layout.pc_bottom_tips}>
                  <Avatar
                    size='small'
                    text={ invitorName?.substring(0, 1)}
                    className={layout.pc_bottom_img}
                    image={ invitorAvatar }/>
                  <span className={layout.pc_bottom_text}>
                    <span>{ invitorName } 邀请您加入站点</span>
                    {/* {siteMode === 'pay' ? <span>，可获得返现 ¥{((10 - siteMasterScale) * sitePrice / 10).toFixed(2)}</span> : ''} */}
                  </span>
              </div>
              : <></>
          }
          <div className={layout.user_card_button} onClick={this.handleJoinSite}>
            {siteMode === 'pay' ? (user.isLogin() ? `¥${sitePrice} ${isRenew ? '续费' : '立即'}加入` : '登录浏览更多内容') : '立即加入' }
          </div>
          {siteMode === 'pay' ? (
            <div className={layout.bottom_title}>
              { user.isLogin() ? <></> : <span>新用户加入 <span className={layout.tips}>¥{sitePrice}</span></span> }
              <span className={!user.isLogin() ? layout.expire : ''}>有效期{ user.isLogin() ? '：' : ' '}<span className={layout.tips}>{siteExpire ? `${siteExpire}天` : '永久'}</span></span>
            </div>
          ) : <></>}
        </div>
        <Copyright/>
      </>
    );
  }

  getBgHeaderStyle() {
    const { site: { webConfig = {} } } = this.props;
    const siteBackgroundImage = get(webConfig, 'setSite.siteBackgroundImage', '');

    if (siteBackgroundImage) {
      return { backgroundImage: `url(${siteBackgroundImage})` };
    }
  }

  contentHeader = () => {
    const { site: { platform, webConfig = {} } } = this.props;
    if (platform === 'h5') {
      return <></>;
    }
    const siteAuthor = get(webConfig, 'setSite.siteAuthor.username', '');
    const siteInstall = get(webConfig, 'setSite.siteInstall', '');
    const siteHeaderLogo = get(webConfig, 'setSite.siteHeaderLogo', '');
    // 兼容ios
    const [siteTimer] = siteInstall.split(' ');
    const startDate = Date.parse(siteTimer);
    const endDate = Date.parse(new Date());
    const createDays = numberFormat(parseInt(Math.abs(startDate  -  endDate) / 1000 / 60 / 60 / 24, 10));
    return (
      <div className={pclayout.content_header} style={{...this.getBgHeaderStyle()}}>
        <img
            className={pclayout.logo}
            mode="aspectFit"
            src={siteHeaderLogo || '/dzq-img/join-banner-bg.png'}
            alt="图片"
        />
        <ul className={pclayout.joinInfo}>
          <li className={pclayout.item}>
            <span className={pclayout.text}>站长</span>
            <span className={pclayout.content}>{siteAuthor || '--'}</span>
          </li>
          <li className={pclayout.item}>
            <span className={pclayout.text}>已创建</span>
            <span className={pclayout.content}>{createDays || 0}天</span>
          </li>
        </ul>
      </div>
    );
  };

  render() {
    const { site: { platform, webConfig = {} }, forum: { updataTime }, user } = this.props;
    const { inviteCode } = this.props.router.query;
    const { setSite: { siteMode, siteExpire, sitePrice, siteMasterScale } = {} } = webConfig;
    const { invitorName, invitorAvatar, isRenew } = this.state;
    const layout = platform === 'h5' ? mlayout : pclayout;
    // 内容数
    const countThreads = get(webConfig, 'other.countThreads', '');
    const isShowLogout = platform === 'h5' && user.isLogin() && !(browser.env('weixin') && this.props.site.isOffiaccountOpen); // h5下非微信浏览器访问时，若用户已登陆，展示退出按钮

    return (
      <PartnerInviteWrap renderRight={this.renderRight} contentHeader={this.contentHeader}>
        <div className={layout.content}>
          {/* 站点加入页退出按钮 */}
          {
            isShowLogout ? (
              <div className={layout.logout} onClick={this.logout}>
                <Icon name="SignOutOutlined" size={20} className={layout.logoutBtn} />
              </div>
            ) : <></>
          }
          {/* 站点信息 start */}
          <SiteInfo threadTotal={countThreads} updataTime={ updataTime }/>
          {/* 站点信息 end */}
          {/* 站点用户 start */}
          <PartnerInviteUser onUserClick={this.handleJoinSite}/>
          {/* 站点用户 end */}
          {/* 热门内容预览 start */}
          <PartnerInviteHot unifyOnClick={this.handleJoinSite}/>
          {/* 热门内容预览 end */}
          {platform === 'h5' && <Copyright className={layout.copyright} />}
          {
            platform === 'h5'
              ? (
                <>
                <div className={layout.bottom}>
                  {
                    inviteCode
                      ? <div className={layout.bottom_tips}>
                          {/* <img className={layout.bottom_tips_img} src={ invitorAvatar } alt=""/> */}
                          <Avatar
                            size='small'
                            text={ invitorName?.substring(0, 1)}
                            className={layout.bottom_tips_img}
                            image={ invitorAvatar }/>
                          <span className={layout.bottom_tips_text}>
                            <span>{ invitorName } 邀请您加入站点</span>
                            {/* {siteMode === 'pay' ? <span>，可获得返现 ¥{((10 - siteMasterScale) * sitePrice / 10).toFixed(2)}</span> : ''} */}
                          </span>
                          <span className={layout.bottom_tips_arrows}></span>
                      </div>
                      : <></>
                  }
                  {siteMode === 'pay' ? (
                    <div className={layout.bottom_title}>
                      { user.isLogin() ? <></> : <span>新用户加入 <span className={layout.tips}>¥{sitePrice}</span></span> }
                      <span className={!user.isLogin() ? layout.expire : ''}>有效期{ user.isLogin() ? '：' : ' '}<span className={layout.tips}>{siteExpire ? `${siteExpire}天` : '永久'}</span></span>
                    </div>
                  ) : <></>}
                  <Button className={layout.bottom_button} onClick={this.handleJoinSite}>
                    { user.isLogin() ? `${siteMode === 'pay' ? `¥${sitePrice} ` : ''}${isRenew ? '续费' : '立即'}加入` : `${siteMode === 'pay' ? '登录浏览更多内容' : '立即加入'}` }
                  </Button>
                </div>
                </>
              )
              : <></>
          }
        {/* <div className={layout.maskLayer}></div> */}
        </div>
      </PartnerInviteWrap>
    );
  }
}

export default withRouter(PartnerInviteH5Page);
