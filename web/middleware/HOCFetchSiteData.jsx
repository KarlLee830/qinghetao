
import React from 'react';
import { inject, observer } from 'mobx-react';
import isServer from '@common/utils/is-server';
import getPlatform from '@common/utils/get-platform';
import { readForum, readUser, readPermissions, readEmoji, readPluginList } from '@server';
import Router from '@discuzqsdk/sdk/dist/router';
import { withRouter } from 'next/router';
import clearLoginStatus from '@common/utils/clear-login-status';
import { REVIEWING } from '@common/store/login/util';
import { Spin, Icon } from '@discuzqsdk/design';
import typeofFn from '@common/utils/typeof';
import setWxShare from '@common/utils/set-wx-share';
import styles from './HOCFetchSiteData.module.scss';
import initWXSDK from '@common/utils/init-wx-sdk';
import canPublish from '@common/utils/can-publish';
import {
  WEB_SITE_JOIN_WHITE_LIST,
  JUMP_TO_404,
  INVALID_TOKEN,
  TOKEN_FAIL,
  JUMP_TO_LOGIN,
  JUMP_TO_REGISTER,
  JUMP_TO_AUDIT,
  JUMP_TO_REFUSE,
  JUMP_TO_DISABLED,
  JUMP_TO_HOME_INDEX,
  SITE_CLOSED,
  JUMP_TO_PAY_SITE,
  JUMP_TO_SUPPLEMENTARY,
  REVIEWING_USER_WHITE_LIST_WEB,
} from '@common/constants/site';
import LoginHelper from '@common/utils/login-helper';
import { USER_STATUS } from '@common/constants/login';
import pluginRequest from '@discuzqsdk/plugin-center/dist/pluginRequest';

// 获取全站数据
export default function HOCFetchSiteData(Component, _isPass) {
  @inject('site')
  @inject('forum')
  @inject('user')
  @inject('thread')
  @inject('emotion')
  @inject('commonLogin')
  @inject('plugin')
  @inject('invite')
  @observer
  class FetchSiteData extends React.Component {
    // 应用初始化
    static async getInitialProps(ctx) {
      try {

        // 根据运行时配置获取参数
        global.ssr_host = global.dzq_host || (ctx.req && ctx.req.headers && ctx.req.headers.host);

        // 将ctx保存到global
        global.ctx = ctx;

        // console.log(global.dzq_host);
        let platform = 'static';
        let siteConfig = {};
        let userInfo;
        let serverSite;
        let __props = {};
        let userData;
        let userPermissions;

        // 服务端
        if (isServer()) {
          const { headers } = ctx.req;
          platform = (headers && !typeofFn.isEmptyObject(headers)) ? getPlatform(headers['user-agent']) : 'static';

          // 请求并保持表情数据
          readEmoji({}, ctx);

          // 获取站点信息
          siteConfig = await readForum({}, ctx);
          serverSite = {
            platform,
            closeSite: siteConfig.code === -3005 ? siteConfig.data : null,
            webConfig: siteConfig && siteConfig.data || null,
          };
          // 当站点信息获取成功，进行当前用户信息查询
          if (siteConfig && siteConfig.code === 0 && siteConfig?.data?.user?.userId) {
            userInfo = await readUser({
              params: { userId: siteConfig.data.user.userId },
            }, ctx);
            userPermissions = await readPermissions({}, ctx);

            userData = (userInfo && userInfo.code === 0) ? userInfo.data : null;
            userPermissions = (userPermissions && userPermissions.code === 0) ? userPermissions.data : null;
          }

          // 获取插件信息
          const pluginConfig = await readPluginList({}, ctx);
          if (pluginConfig.code === 0) serverSite.pluginConfig = pluginConfig.data;

          // 传入组件的私有数据
          if (siteConfig && siteConfig.code === 0 && Component.getInitialProps) {
            __props = await Component.getInitialProps(ctx, { user: userData, site: serverSite });
          }
        }

        return {
          ...__props,
          // serverSite: {},
          // serverUser: {},
          serverSite,
          serverUser: {
            userInfo: userData,
            userPermissions,
          },
        };
      } catch (err) {
        console.log('err', err);
        return {
          serverSite: {},
          serverUser: {},
        };
      }
    }

    constructor(props) {
      super(props);
      this.handleWxShare = this.handleWxShare.bind(this);
      this.canPublish = this.canPublish.bind(this);
      let isNoSiteData;
      const { serverUser, serverSite, serverEmotion, user, site, emotion, forum } = props;
      serverSite && serverSite.platform && site.setPlatform(serverSite.platform);
      serverSite && serverSite.closeSite && site.setCloseSiteConfig(serverSite.closeSite);
      serverSite && serverSite.webConfig && site.setSiteConfig(serverSite.webConfig);
      serverSite && serverSite.webConfig && forum.setOtherPermissions(serverSite.webConfig);
      serverSite && serverSite.pluginConfig && site.setPluginConfig(serverSite.pluginConfig);

      serverUser && serverUser.userInfo && user.setUserInfo(serverUser.userInfo);
      serverUser && serverUser.userPermissions && user.setUserPermissions(serverUser.userPermissions);
      serverEmotion && serverEmotion.emojis && emotion.setEmoji(serverEmotion.emojis);

      if (!isServer()) {
        isNoSiteData = !((site && site.webConfig));
      } else {
        isNoSiteData = !serverSite;
      }

      this.state = {
        isNoSiteData,
        isPass: isServer() ? true : false, // SSR渲染，默认通过，由浏览器进行验证
      };
    }

    async componentDidMount() {
      const { isNoSiteData } = this.state;
      const { serverUser, serverSite, user, site, emotion, forum } = this.props;
      let siteConfig;
      let loginStatus = false;

      // 设置邀请码
      const sikpPath = decodeURIComponent(this.props.router.asPath);
      const reg = new RegExp('(^|[&|?])inviteCode=([^&]*)(&|$)');
      const r = sikpPath.match(reg);
      r && this.props.invite.setInviteCode(r[2])

      // 请求并保持表情数据
      if (!emotion.emojis?.length) {
        emotion.fetchEmoji();
      }

      // 设置平台标识
      site.setPlatform(getPlatform(window.navigator.userAgent));

      if (isNoSiteData) {
        siteConfig = serverSite?.webConfig || null;
        if (!siteConfig) {
          const result = await readForum({});
          result.data && site.setSiteConfig(result.data);
          result.data && forum.setOtherPermissions(result.data);

          // 设置全局状态
          this.setAppCommonStatus(result);
          siteConfig = result.data || null;
        }
      } else {
        siteConfig = site ? site.webConfig : null;
      }

       // 获取插件信息
       if ( site && site.pluginConfig ) {
        pluginRequest(site.pluginConfig, this.props.plugin.setPluginComponent.bind(this.props.plugin));
       } else {
        const pluginConfig = await readPluginList();
        if (pluginConfig.code === 0) {
          site.setPluginConfig(pluginConfig.data);
          pluginRequest(pluginConfig.data, this.props.plugin.setPluginComponent.bind(this.props.plugin));
        }
       }


      // 初始化登陆方式
      site.initUserLoginEntryStatus();

      // 判断是否有token
      if (siteConfig && siteConfig.user) {
        if ((!user || !user.userInfo) && (!serverUser || !serverUser.userInfo)) {
          const userInfo = await readUser({ params: { userId: siteConfig.user.userId } });
          const userPermissions = await readPermissions({});

          // 添加用户发帖权限
          userPermissions.code === 0 && userPermissions.data && user.setUserPermissions(userPermissions.data);
          // 当客户端无法获取用户信息，那么将作为没有登录处理
          userInfo.data && user.setUserInfo(userInfo.data);
          loginStatus = !!userInfo.data;
        } else {
          loginStatus = true;
        }
      } else {
        loginStatus = false;
      }

      user.updateLoginStatus(loginStatus);
      let defaultPass = this.isPass(isNoSiteData);
      // 自定义pass逻辑
      if ( _isPass && defaultPass) {
        defaultPass = _isPass(defaultPass);
      }
      this.setState({ isPass: defaultPass });

      // 初始化微信jssdk配置
      const isInit = await initWXSDK(siteConfig && siteConfig.passport && siteConfig.passport.offiaccountOpen);
      if (isInit) {

        // 微信分享全局处理
        // step1: 初始化分享配置，需要等forum接口及offiaccount/jssdk接口返回并完成wx.config后执行
        this.handleWxShare(this.props.router.asPath);
        // step2: 路由守卫，每次路由变更后根据分享规则重新进行分享配置
        this.props.router.events.on('routeChangeComplete', this.handleWxShare);

      }
    }

    // 每次跳转，重新进行微信分享设置：（分享规则：https://docs.qq.com/sheet/DYWpnQkZZZFR3YWN3）
    handleWxShare(route) {
      if (!(window.wx && window.wx.hasDoneConfig)) {
        return;
      }

      const { user, site } = this.props;
      const { userInfo } = user;
      const { webConfig: { setSite } } = site;
      const { siteName, siteIntroduction, siteHeaderLogo, siteFavicon } = setSite;
      const { nickname, avatarUrl, signature, id } = userInfo || {};

      // 默认分享标题
      let title = document.title;
      // 默认分享描述内容：站点介绍前35个字符 + ‘...’
      let desc = siteIntroduction ?
      (siteIntroduction.length > 35 ? `${siteIntroduction.substr(0, 35)}...` : siteIntroduction) :
      '在这里，发现更多精彩内容';
      // 默认分享链接
      let link = window.location.href;
      // 默认分享图片
      let img = siteHeaderLogo || siteFavicon;

      /**
       * 不适用默认分享，需要特殊处理的页面
       */

      // 详情页分享逻辑较复杂，已在业务单独处理
      if (route.match(/\/thread\/\d+/)) {
        return;
      }

      // 他人主页 - 业务处理
      if (route.match(/\/user\/\d+/)) {
        return;
      }

      // 我的主页
      if (route === '/my') {
        if (nickname) {
          title = `${nickname}的主页`;
          img = avatarUrl;
          desc = signature ?
          (signature.length > 35 ? `${signature.substr(0, 35)}...` : signature) :
          '在这里，发现更多精彩内容';
          link = `${window.location.origin}/user/${id}`;
        }
      }

      // 注册、登录、付费加入页
      if (route.includes('/forum/partner-invite') || route.match(/\/user\/(username|wx|phone)-login/) || route.includes('/user/register')) {
        title = `邀请您加入${siteName}`;
      }

      // 首页、推广邀请
      if (route.includes('/invite') || route === '/') {
        title = `${nickname || ''}邀请您加入${siteName}`;
      }

      // 私聊页面分享出去点击访问消息模块首页
      if (route.includes('/message?page=chat')) {
        title = `我的私信 - ${siteName}`;
        link = `${window.location.origin}/message`;
      }

      // 设置分享
      setWxShare(title, desc, link, img, id);
    }

    setAppCommonStatus(result) {
      const { site } = this.props;

      const CODE_NEED_SAVE = [JUMP_TO_LOGIN, JUMP_TO_REGISTER, JUMP_TO_AUDIT, JUMP_TO_REFUSE, JUMP_TO_DISABLED, JUMP_TO_SUPPLEMENTARY, JUMP_TO_PAY_SITE];
      if (CODE_NEED_SAVE.includes(result.code)) {
        LoginHelper.saveCurrentUrl();
      }

      switch (result.code) {
        case 0:
          break;
        case SITE_CLOSED: // 关闭站点
          site.setCloseSiteConfig(result.data);
          Router.redirect({ url: '/close' });
          break;
        case INVALID_TOKEN:// 没有权限,只能针对forum接口做此判断
          break;
        case TOKEN_FAIL:// token无效
          clearLoginStatus();
          window.location.reload();
          break;
        case JUMP_TO_404:// 资源不存在
          Router.redirect({ url: '/404' });
          break;
        case JUMP_TO_LOGIN:// 到登录页
          clearLoginStatus();
          LoginHelper.gotoLogin();
          break;
        case JUMP_TO_REGISTER:// 到注册页
          clearLoginStatus();
          LoginHelper.saveAndRedirect('/user/register');
          break;
        case JUMP_TO_AUDIT:// 到审核页
          Router.push({ url: '/user/status?statusCode=2' });
          break;
        case JUMP_TO_REFUSE:// 到审核拒绝页
          Router.push({ url: '/user/status?statusCode=-4007' });
          break;
        case JUMP_TO_DISABLED:// 到审核禁用页
          Router.push({ url: '/user/status?statusCode=-4009' });
          break;
        case JUMP_TO_SUPPLEMENTARY:// 跳转到扩展字段页
          LoginHelper.saveAndRedirect('/user/supplementary');
          break;
        case JUMP_TO_HOME_INDEX:// 到首页
          Router.redirect({ url: '/' });
          break;
        case JUMP_TO_PAY_SITE:// 到付费加入页面
          LoginHelper.saveAndRedirect('/forum/partner-invite');
          break;
        default:
          site.setErrPageType('site');
          Router.redirect({ url: '/500' });
          break;
      }
    }

    // 检查跳转
    checkJump() {
      const { router } = this.props;
      const jumpPage = LoginHelper.getUrl();
      if (jumpPage) {
        const urlObj = new URL(jumpPage);
        // 目标地址已达到，清空即可。首页之分类页地址与asPath不一致，需容错处理
        if (urlObj.pathname === router.asPath || urlObj.pathname.includes('/cate/')) {
          LoginHelper.clear()
        } else if (router.asPath === '/') { // 被重定向到首页，取出跳转地址，跳转
          LoginHelper.restore();
          return false;
        }
      }
      return true;
    }

    // 检查是否满足渲染条件
    isPass(isNoSiteData) {
      const { site, router, user, commonLogin } = this.props;
      if (site && site.webConfig) {
        isNoSiteData && this.setState({
          isNoSiteData: false,
        });
        // 关闭站点
        if (router.asPath !== '/close' && site.closeSiteConfig) {
          Router.redirect({ url: '/close' });
          return false;
        }

        // 前置: 用户已登录
        if (user.isLogin()) {
          // TODO: 需要在微信绑定页获取设置uid的缓存才能开启强制跳转绑定微信
          // // 绑定微信：开启微信，没有绑定微信
          // if (
          //   router.asPath !== '/user/wx-bind-qrcode'
          //     && (site.isOffiaccountOpen || site.isMiniProgramOpen)
          //     && !user.isBindWechat
          // ) {
          //   Router.redirect({ url: '/user/wx-bind-qrcode' });
          // }
          // 前置：没有开启微信
          if (!site.isOffiaccountOpen && !site.isMiniProgramOpen) {
            // 绑定手机: 开启短信，没有绑定手机号
            if (router.asPath !== '/user/bind-phone' && site.isSmsOpen && !user.mobile) {
              LoginHelper.saveAndRedirect( '/user/bind-phone' );
              return false;
            }
          }
          // 绑定昵称：没有昵称
          if (router.asPath !== '/user/bind-nickname' && !user.nickname) {
            commonLogin.needToCompleteExtraInfo = (user.userStatus === USER_STATUS.SUPPLEMENTARY);
            LoginHelper.saveAndRedirect( '/user/bind-nickname' );
            return false;
          }
          // 账号审核中的 用户只能访问 首页 + 帖子详情页，以及用户状态提示页
          if (user.userStatus === REVIEWING) {
            if (!REVIEWING_USER_WHITE_LIST_WEB.includes(router.pathname)) {
              Router.replace({ url: `/user/status?statusCode=${user.userStatus}` });
              return false;
            }
          }
        }

        // 以下为付费模式相关判断
        if (site?.webConfig?.setSite?.siteMode === 'pay') {
          // 付费加入: 付费状态下，未登录的用户、登录了但是没有付费的用户，访问不是白名单的页面会跳入到付费加入
          if (WEB_SITE_JOIN_WHITE_LIST.some(path => router.asPath.match(path))) {
            this.checkJump();
            return true;
          }

          const code = router.query.inviteCode;
          const query = code ? `?inviteCode=${code}` : '';
          if ((!user?.paid && user?.group?.level === 0) || !user.isLogin()) {
            LoginHelper.saveAndRedirect(`/forum/partner-invite${query}`);
            return false;
          }
        }
      }

      return this.checkJump();
    }

    // 过滤多余参数
    filterProps(data) {
      const newProps = {
        ...data,
      };
      delete newProps.serverUser;
      delete newProps.serverSite;
      delete newProps.user;
      delete newProps.site;
      return newProps;
    }

    /**
     * 是否可以进行发帖回复
     * @param type 判断类型 comment 评论， reply 回复
     */
    canPublish(type = '') {
      const { user, site, thread } = this.props;
      return canPublish(user, site, type, thread?.threadData?.threadId);
    }

    render() {

      const { isNoSiteData, isPass } = this.state;
      const { site } = this.props;
      // CSR不渲染任何内容
      if (site.platform === 'static') return null;

      if (isNoSiteData || !isPass) {
        return (
          <div className={styles.loadingBox}>
            <Icon className={styles.loading} name="LoadingOutlined" size="large" />
          </div>
        );
      }
      return <Component canPublish={this.canPublish} {...this.filterProps(this.props)}/>
    }
  }

  return withRouter(FetchSiteData);
}
