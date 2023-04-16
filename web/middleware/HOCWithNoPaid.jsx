
import React from 'react';
import { inject, observer } from 'mobx-react';
import isServer from '@common/utils/is-server';
import Router from '@discuzqsdk/sdk/dist/router';
import LoginHelper from '@common/utils/login-helper';


// 只能非登陆状态才能进入
export default function HOCWithNoPaid(Component) {
  @inject('user')
  @observer
  class CheckNoPaid extends React.Component {
    // 应用初始化
    static async getInitialProps(ctx, preProps) {
      if (!preProps) {
        throw Error('CheckNoPaid必须前置使用HOCFetchSiteData');
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

    // 已付费用户滞留付费页处理
    handlePaidUserRedirect() {
      const { router, user } = this.props;
      if ((user?.paid || user?.group?.level > 0) && router.pathname === '/forum/partner-invite') {
        LoginHelper.restore();
      }
    }

    componentDidMount() {
      this.handlePaidUserRedirect();
    }

    componentDidUpdate() {
      this.handlePaidUserRedirect();
    }

    render() {
      const { user } = this.props;
      if (user?.paid || user?.group?.level > 0) return null;
      return <Component {...this.props}/>;
    }
  }

  return CheckNoPaid;
}
