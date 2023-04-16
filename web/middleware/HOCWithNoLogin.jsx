
import React from 'react';
import { inject, observer } from 'mobx-react';
import isServer from '@common/utils/is-server';
import Router from '@discuzqsdk/sdk/dist/router';


// 只能非登陆状态才能进入
export default function HOCWithNoLogin(Component) {
  @inject('user')
  @observer
  class CheckNoLoginStatus extends React.Component {
    // 应用初始化
    static async getInitialProps(ctx, preProps) {
      if (!preProps) { 
        throw Error('CheckNoLoginStatus必须前置使用HOCFetchSiteData');
      }

      try {
        let __props = {};


        // 服务端，当必须登录的情况下，如果没有检测到登录状态，将不会触发Component的getInitialProps
        if (isServer()) {
          // 传入组件的私有数据
          if (Component.getInitialProps) {
            __props = await Component.getInitialProps(ctx);
          }
        }

        return {
          ...__props,
        };
      } catch (err) {
        console.log('err', err);
        return {};
      }
    }

    constructor(props) {
      super(props);
    }

    componentDidMount() {
      const { user } = this.props;
      if (user.loginStatus) {
        Router.redirect({url: '/'});
      }
    }

    // TODO： 目前只有登录注册相关使用这个中间件，页面登录需要更新数据，当前周期会导致刷新首页，这个先注释
    // componentDidUpdate() {
    //   const { user } = this.props;
    //   if (user.loginStatus) {
    //     Router.redirect({url: '/'});
    //   }
    // }

    render() {
      const { user } = this.props;
      const { loginStatus } = user;
      if (loginStatus) return null;
      return <Component {...this.props}/>;
    }
  }

  return CheckNoLoginStatus;
}
