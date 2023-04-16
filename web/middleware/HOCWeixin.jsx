import React from 'react';
import isServer from '@common/utils/is-server';
import isWeiXin from '@common/utils/is-weixin';
import { Toast } from '@discuzqsdk/design';
import { inject } from 'mobx-react';

export default function HOCWeixin(Component) {
  @inject('site')
  class HOCWeixinComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        isWeiXin: false,
      };
      if (isServer() || !this.props.site.isOffiaccountOpen || this.props.site.isMiniProgramOpen) return;
      // 如果在微信环境内，则直接拉起登录
      if (isWeiXin()) {
        this.target = Toast.loading({
          content: '微信登录中...',
          duration: 0,
        });
        this.state.isWeiXin = true;
        const redirectEncodeUrl = encodeURIComponent(`${window.location.origin}/user/wx-auth`);
        window.location.href = `${window.location.origin}/api/v3/users/wechat/h5.oauth?redirect=${redirectEncodeUrl}`;
      }
    }
    componentWillUnmount() {
      if (isWeiXin()) {
        this?.target?.hide();
      }
    }

    render() {
      return this.state.isWeixin ? <div>Loading</div> : <Component {...this.props} /> ;
    }
  }

  return HOCWeixinComponent;
}
