import React, { Component } from 'react';
import { Provider } from 'mobx-react';
import initializeStore from '@common/store';
import Taro from '@tarojs/taro'
import Router from '@discuzqsdk/sdk/dist/router';
import setTitle from '@common/utils/setTitle';
import LoginHelper from '@common/utils/login-helper'
import DZQPluginCenter from '@discuzqsdk/plugin-center';
import { STORAGE_KEY } from '@common/utils/viewcount-in-storage';
import './app.scss';

// 本地调试时全局引入组件库样式，生产构建时在pages/index中进行引入
if (process.env.NODE_ENV === 'development') {
  require('@discuzqsdk/theme/src/index.scss');
}

const appStore = initializeStore();
DZQPluginCenter.initStore(appStore.plugin.setPluginComponent.bind(appStore.plugin));

class App extends Component {

  store = appStore;

  async componentDidMount() {
  }

  /**
   * 在小程序环境中对应 app 的 onLaunch
   *
   * @param {object} options 程序初始化参数
   * @param {string} options.path 启动小程序的场景值
   * @param {number} options.scene 启动小程序的 query 参数
   * @param {string} options.shareTicket 转发信息
   * @param {object} options.referrerInfo 来源信息。从另一个小程序、公众号或 App 进入小程序时返回。否则返回 {}
   * @param {string} options.referrerInfo.appId 来源小程序，或者公众号（微信中）
   * @param {object} options.referrerInfo.extraData 来源小程序传过来的数据，微信和百度小程序在 scene=1037 或 1038 时支持
   * @param {string} options.referrerInfo.sourceServiceId 来源插件，当处于插件运行模式时可见。
   * 注意：options 参数的字段在不同小程序中可能存在差异。所以具体使用的时候请看相关小程序的文档
   */
  async onLaunch(options) {

    // 如果是分享朋友圈进入的，不进入下面跳转逻辑
    const {scene, query} = options;
    if ( scene === 1154  ) {
      return;
    }

    const { site } = this.store;
    const { envConfig } = site;
    const { TITLE } = envConfig;
    if (TITLE && TITLE !== '') {
      setTitle(TITLE);
    }

    // 如果启动页面不是pages/index/index，那么将保留路径，跳去启动页
    // 暂时发现是小程序分享朋友圈无法设置url
    const $instance = Taro.getCurrentInstance()
    const router = $instance.router;
    const {path, params} = router;
    if (path.indexOf('pages/index/index') === -1) {
      let targetUrl = path;
      let targetParmas = '';
      const paramsArr = [];
      for (let key in params) {
        paramsArr.push(`${key}=${params[key]}`);
      }
      if (paramsArr.length > 0) {
        targetParmas = paramsArr.join('&');
      }
      if (targetParmas !== '') {
        targetUrl = `${targetUrl}?${targetParmas}`;
      }
      if (targetUrl[0] !== '/') {
        targetUrl = `/${targetUrl}`;
      }
      Router.redirect({
        url: `/pages/index/index?path=${encodeURIComponent(targetUrl)}`,
        fail: (err) => {
          console.log(err)
        }
      });
    }
  }

  /**
   * 程序启动，或切前台时触发，和 onLaunch 生命周期一样
   * @param {object} options 程序初始化参数
   * 参数于 onLaunch 中获取的基本一致，如上；但百度小程序中补充两个参数如下（具体在使用的时候需要自测）：
   * @param {string} options.entryType 展现的来源标识
   * @param {string} options.appURL 展现时的调起协议，仅当 entryType 值为 schema 时存在
   */
  componentDidShow(options) {
    // 捕获从其它小程序返回的验证码result
    this.onCaptchaResult(options);

    // 记录跳转的目的页。目前分享地址统一格式为；/pages/index/index?path={targetUrl}
    try {
      const { path, query} = options;
      let targetUrl;
      if (path === 'pages/index/index') {
        targetUrl = decodeURIComponent(query.path || '');
      } else {
        targetUrl = path;
        if (Object.keys(query).length > 0) {
          targetUrl = `${path}?${Object.entries(query).map(([key, value])=> `${key}=${value}`).join('&')}`;
        }
      }

      LoginHelper.setUrl(targetUrl);
    } catch(err) {
      console.log('savePageJump', err);
    }

    // 清除帖子浏览计数
    Taro.removeStorageSync(STORAGE_KEY)
  }

  /**
   * 程序要打开的页面不存在时触发
   * @param {object} options 参数
   * @param {string} options.path 不存在页面的路径
   * @param {object} options.query 打开不存在页面的query参数
   * @param {boolean} options.isEntryPage 是否本次启动的收个页面（例如从分享等入口进来，收个页面是开发者配置的分享页面）
   */
  onPageNotFound(options) {
    Router.redirect({
      url: '/subPages/404/index'
    });
  }

  // 处理验证码捕获
  onCaptchaResult(options) {
    // 1 检查验证码票据
    if (!this.captchaTicketExpire) this.captchaTicketExpire = {};
    // 2 判断场景、场景id。 1038场景：从其它小程序返回
    if (options.scene === 1038 && options.referrerInfo.appId === 'wx5a3a7366fd07e119') {
      const result = options.referrerInfo.extraData;
      if (result && result.ret === 0) {
        // 验证成功
        const theTicket = result.ticket;
        if (!this.captchaTicketExpire[theTicket]) {
          this.captchaTicketExpire[theTicket] = true;
          Taro.eventCenter.trigger('captchaResult', result);
        }
      } else {
        // 用户关闭验证
        Taro.eventCenter.trigger('closeChaReault', result);
      }
    }
  }

  render() {
    const { children } = this.props;
    return (
      <Provider {...this.store}>
        {/* this.props.children 就是要渲染的页面 */}
          {children}
      </Provider>
    );
  }
}

export default App;
