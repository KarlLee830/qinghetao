import React from 'react';
import { inject } from 'mobx-react';

export default function HOCUserInfo(Component) {
  @inject('user')
  class HOCUserInfoComponent extends React.Component {
    constructor(props) {
      super(props);
      // 如果缺失 userInfo，页面中进行一次初始化获取
      if (!this.props.user.userInfo) {
        this.props.user.updateUserInfo(this.props.user.id);
      }
    }

    render() {
      return <Component {...this.props} /> ;
    }
  }

  return HOCUserInfoComponent;
}
