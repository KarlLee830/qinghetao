import React from 'react';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCWithLogin from '@middleware/HOCWithLogin';
import { inject, observer } from 'mobx-react';
import MyH5Page from '@layout/my/h5';
import MyPCPage from '@layout/my/pc';
import ViewAdapter from '@components/view-adapter';
import clearLoginStatus from '@common/utils/clear-login-status';

@inject('site')
@observer
class MyCenter extends React.Component {
  logout = () => {
    clearLoginStatus();
    window.location.replace('/');
  };

  render() {
    return <ViewAdapter h5={<MyH5Page />} pc={<MyPCPage />} title={`个人中心`} />;
  }
}

export default HOCFetchSiteData(HOCWithLogin(MyCenter));
