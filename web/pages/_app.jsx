import React from 'react';
import { Provider } from 'mobx-react';
import { hideInstance } from '@discuzqsdk/design/dist/components/image-previewer/layouts/web';
import App from 'next/app';
import getPlatform from '@common/utils/get-platform';
import initializeStore from '@common/store';
import PayBoxProvider from '../components/payBox/payBoxProvider';
import isServer from '@common/utils/is-server';
import csrRouterRedirect from '@common/utils/csr-router-redirect';
import Router from '@discuzqsdk/sdk/dist/router';
// 引入antdesgin
import 'antd/dist/antd.css';
// import sentry from '@common/utils/sentry';
import '../styles/index.scss';
import CustomHead from '@components/custom-head';
import Head from 'next/head';
import monitor from '@common/utils/monitor';
import { detectH5Orient } from '@common/utils/detect-orient';
import browser from '@common/utils/browser';
import Toast from '@discuzqsdk/design/dist/components/toast';
import { STORAGE_KEY, STORAGE_TYPE } from '@common/utils/viewcount-in-storage';
import DZQPluginCenter from '@discuzqsdk/plugin-center';
import PluginDevelopTools from '../utils/PluginDevelopTools';
import { throttle } from '@common/utils/throttle-debounce.js';

// if (!isServer()) {
//   process.env.NODE_ENV === 'production' && sentry();
// }
const appStore = initializeStore();
DZQPluginCenter.initStore(appStore.plugin.setPluginComponent.bind(appStore.plugin));

class DzqApp extends App {
  constructor(props) {
    super(props);
    this.appStore = appStore;
    this.updateSize = throttle(this.updateSize.bind(this), 100);
    this.toastInstance = null;
  }

  // 路由跳转时，需要清理图片预览器
  cleanImgViewer = () => {
    try {
      if (hideInstance) {
        hideInstance();
      }
    } catch (e) {
      console.error(e);
    }
  };

  listenRouterChangeAndClean() {
    // FIXME: 此种写法不好
    if (!isServer()) {
      window.addEventListener('popstate', this.cleanImgViewer, false);
    }
  }

  componentDidMount() {
    console.log(process.env.DISCUZ_BUILDINFO);
    if (window.performance) {
      monitor.call('reportTime', {
        eventName: 'fist-render',
        duration: Date.now() - performance.timing.navigationStart,
      });
    }

    this.initOretation();
    window.addEventListener('resize', this.updateSize);
    csrRouterRedirect();
    this.listenRouterChangeAndClean();

    if (!isServer()) {
      window.addEventListener("beforeunload", () => {
        if(STORAGE_TYPE === "session") sessionStorage.removeItem(STORAGE_KEY);
      });
    }

    //  // 测试
    // setTimeout(() => {
    //   let js = false;
    //   let css = false;
      // const script = document.createElement('script');
      // script.src = "http://0.0.0.0:8081/dist/CustomIfram/index.js";
      // script.onload = () => {
      //   console.log('加载完毕！');
      //   js = true;
      //   // if (css) {
      //     const {map, pluginName} = DZQPluginCenter.register(window.DZQPlugin['CustomIfram'].default);
      //     console.log()
      //     this.appStore.plugin.setPluginComponent(pluginName, map);

      //   // }
    //   }

    //   const script2 = document.createElement('script');
    //   script2.src = "http://0.0.0.0:8081/dist/CustomIframDisplay/index.js";
    //   script2.onload = () => {
    //     console.log('加载完毕！');
    //     js = true;
    //     // if (css) {
    //       const {map, pluginName} = DZQPluginCenter.register(window.DZQPlugin['CustomIframDisplay'].default);
    //       console.log()
    //       this.appStore.plugin.setPluginComponent(pluginName, map);

    //     // }
    //   }

    //   const script3 = document.createElement('script');
    //   script3.src = "http://0.0.0.0:8081/dist/CustomIframPost/index.js";
    //   script3.onload = () => {
    //     console.log('加载完毕！');
    //     js = true;
    //     // if (css) {
    //       const {map, pluginName} = DZQPluginCenter.register(window.DZQPlugin['CustomIframPost'].default);
    //       console.log()
    //       this.appStore.plugin.setPluginComponent(pluginName, map);

    //     // }
    //   }

    //   // document.body.appendChild(link);
    //   document.body.appendChild(script);
    //   document.body.appendChild(script2);
    //   document.body.appendChild(script3);
    // }, 3000);
  }

  componentWillUnmount() {
    if (!isServer()) {
      window.removeEventListener('resize', this.updateSize);
      window.removeEventListener('popstate', this.cleanImgViewer);
      window.removeEventListener("beforeunload", () => {
        if(STORAGE_TYPE === "session") sessionStorage.removeItem(STORAGE_KEY);
      });
    }
  }

  // 出错捕获
  componentDidCatch(error, info) {
    console.error(error);
    console.error(info);
    // Router.replace({ url: '/render-error' });
  }

  // 移动端检测横屏
  initOretation() {
    this.toastInstance?.destroy();

    if (browser.env('mobile') && !browser.env('iPad')) {
      const isVertical = detectH5Orient();
      if (!isVertical) {
        this.toastInstance = Toast.info({
          content: '为了更好的体验，请使用竖屏浏览',
          duration: 5000,
        });
      }
    }
  }

  updateSize() {
    const oldPlatform = this.appStore.site.platform;
    const newPlatform = getPlatform(window.navigator.userAgent);
    this.appStore.site.setPlatform(newPlatform);
    this.initOretation();

    if (oldPlatform !== newPlatform) {
      console.log('重新注册插件');
      DZQPluginCenter.refreshRegister();
    }
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <div className={`dzq-theme--${this.appStore.site.theme}`}>
        <Provider {...this.appStore}>
          <Head>
            <meta
              key="viewport"
              name="viewport"
              content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover"
            />
          </Head>
          <CustomHead />
         <PluginDevelopTools/>
          <PayBoxProvider>
            <Component {...pageProps} />
          </PayBoxProvider>
        </Provider>
      </div>
    );
  }
}

export default DzqApp;
