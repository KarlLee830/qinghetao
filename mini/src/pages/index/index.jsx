import React from 'react';
import { inject, observer } from 'mobx-react'
import './discuzq.scss';
import styles from './index.module.scss';
import { View } from '@tarojs/components';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Toast from '@discuzqsdk/design/dist/components/toast';
import clearLoginStatus from '@common/utils/clear-login-status';
import Router from '@discuzqsdk/sdk/dist/router';
import {readForum, readUser, readPermissions, readPluginList} from '@server';
import Taro from '@tarojs/taro';
import {
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
  SITE_NO_INSTALL,
  MINI_SITE_JOIN_WHITE_LIST
} from '@common/constants/site';
import LoginHelper from '@common/utils/login-helper';

const PARTNER_INVITE_URL = '/subPages/forum/partner-invite/index';
const CLOSE_URL = '/subPage/close/index';


@inject('site')
@inject('user')
@inject('invite')
@inject('emotion')
@observer
class Index extends React.Component {

    $instance = Taro.getCurrentInstance()

    componentDidShow() {
      this.initSiteData();
    }

    // 检查站点状态
    setAppCommonStatus(result) {
      const { site } = this.props;
      switch (result.code) {
        case 0:
          // 未开启小程序，展示错误页面信息
          if(result?.data?.passport?.miniprogramOpen === false) {
            site.setErrPageType('site');
            Router.redirect({
              url: '/subPages/500/index'
            });
          }
          break;
        case SITE_CLOSED: site.setCloseSiteConfig(result.data);// 关闭站点
          Router.redirect({
            url: '/subPages/close/index'
          });
          return false;
        case INVALID_TOKEN:// 没有权限,只能针对forum接口做此判断
          break;
        case TOKEN_FAIL:// token无效
          clearLoginStatus();
          this.initSiteData(); // 重新获取数据
          return false;
        case JUMP_TO_404:// 资源不存在
          Router.redirect({ url: '/subPages/404/index' });
          break;
        case JUMP_TO_LOGIN:// 到登录页
          clearLoginStatus();
          this.initSiteData(); // 重新获取数据
          LoginHelper.saveAndLogin();
          break;
        case JUMP_TO_REGISTER:// 到注册页
          clearLoginStatus();
          this.initSiteData(); // 重新获取数据
          LoginHelper.saveAndLogin();
          break;
        case JUMP_TO_AUDIT:// 到审核页
          Router.push({ url: '/userPages/user/status/index?statusCode=2' });
          break;
        case JUMP_TO_REFUSE:// 到审核拒绝页
          Router.push({ url: '/userPages/user/status/index?statusCode=-4007' });
          break;
        case JUMP_TO_DISABLED:// 到审核禁用页
          Router.push({ url: '/userPages/user/status/index?statusCode=-4009' });
          break;
        case JUMP_TO_HOME_INDEX:// 到首页
          Router.redirect({ url: '/indexPages/home/index' });
          break;
        case JUMP_TO_PAY_SITE:// 到付费加入页面
          LoginHelper.saveAndRedirect(PARTNER_INVITE_URL);
          break;
        case JUMP_TO_SUPPLEMENTARY:// 跳转到扩展字段页
          LoginHelper.saveAndPush('/userPages/user/supplementary/index');
          break;
        case SITE_NO_INSTALL:// 未安装站点
          Router.push({ url: '/subPages/no-install/index' });
          break;
        default:
          site.setErrPageType('site');
          Router.redirect({url: '/subPages/500/index'});
          clearLoginStatus();
          Toast.error({
            content: result.msg || '未知错误'
          })
          break;
      }
      return true;
    }

    // 初始化站点数据
    async initSiteData() {
      // 是否需要清理当前数据重新加载
      const { params } = this.$instance.router;

      if (params.reload === 'true') {
        this.props.user.removeUserInfo();
        await this.props.site.getSiteInfo();
      }

      const { site, user, emotion } = this.props;

      // 请求并保持表情数据
      emotion.fetchEmoji()

      let loginStatus = false;

      site.setPlatform('mini');

      let webConfig;
      // 有登录态，但是siteStore中没有user数据的情况，也需要重新获取forum数据
      if ( !site.webConfig || ( user.isLogin() && !site.webConfig.user ) ) {
        // 获取站点信息
        const siteResult = await readForum({});
        // 检查站点状态
        const isPass = this.setAppCommonStatus(siteResult);
        if(!isPass) return;
        site.setSiteConfig(siteResult.data);
        const pluginConfig = await readPluginList();
        if (pluginConfig.code === 0) site.setPluginConfig(pluginConfig.data);
        webConfig = siteResult.data;
      } else {
        webConfig = site.webConfig;
      }


      if( webConfig && webConfig.user ) {

        const userInfo = await readUser({ params: { userId: webConfig.user.userId } });
        const userPermissions = await readPermissions({});

        // 添加用户发帖权限
        userPermissions.code === 0 && userPermissions.data && user.setUserPermissions(userPermissions.data);
        // 当客户端无法获取用户信息，那么将作为没有登录处理
        userInfo.code === 0 && userInfo.data && user.setUserInfo(userInfo.data);

        loginStatus = !!userInfo.data && !!userInfo.data.id;
      }

      // 未登陆状态下，清空accessToken
      !loginStatus && clearLoginStatus();

      user.updateLoginStatus(loginStatus);
      const { router} = this.$instance;

      // 取出邀请码进行存储
      if(router.params && router.params.path) {
        const sikpPath = decodeURIComponent(router.params.path);
        const reg = new RegExp(`(^|[&|?])[inviteCode|scene]=([^&]*)(&|$)`);
        const r = sikpPath.match(reg);
        r && this.props.invite.setInviteCode(r[2])
      }
      if(router.params && (router.params.inviteCode || router.params.scene)) {
        this.props.invite.setInviteCode(router.params.inviteCode || router.params.scene)
      }

      const isGoToHome = await this.isPass();
      if (isGoToHome ) {
        // 带有指定的路径，将不去首页。
        const { path } = router;
        // 如果扫码进来，参数path需要兼容，当前的路由会变为参数的path地址
        if (path.indexOf('pages/index/index') === -1) {
          const {path: targetPath, params} = router;
          Router.redirect({
            url: targetPath,
            params,
            fail: () => {
              Router.redirect({
                url: '/indexPages/home/index'
              });
            }
          });
        }
        else if (router.params && router.params.path) {
          Router.redirect({
            url: decodeURIComponent(router.params.path),
            fail: () => {
              Router.redirect({
                url: '/indexPages/home/index'
              });
            }
          });
        } else {
          Router.redirect({
            url: '/indexPages/home/index'
          });
        }
      } else {
        site.setErrPageType('site');
        Router.redirect({
          url: '/subPages/500/index'
        });
      }
    }

  // 检查是否满足渲染条件
  isPass() {
    const { site, user } = this.props;
    const { path } = Taro.getCurrentInstance().router;
    const siteMode = site?.webConfig?.setSite?.siteMode;

    if (site?.webConfig) {
      // 关闭站点
      if (site.closeSiteConfig) {
        Router.redirect({ url: CLOSE_URL });
        return false;
      }

      // 付费模式处理
      if (siteMode === 'pay') {
        // 未付费用户访问非白名单页面，强制跳转付费页
        if (!MINI_SITE_JOIN_WHITE_LIST.includes(path)) {
          if (!user.isLogin() || (!user.paid && user?.group?.level === 0) ) {
            Router.redirect({ url: PARTNER_INVITE_URL });
            return false;
          }
        }
      }
    } else {
      return false;
    }

    return true;
  }

  render() {
    return (
      <View className={styles.loadingBox}>
        <Icon className={styles.loading} name="LoadingOutlined" size="large" />
      </View>
    );
  }
}

// eslint-disable-next-line new-cap
export default Index;
