import React from 'react';
import WXAuthorizationPage from '@layout/user/h5/wx-authorization';
import { inject } from 'mobx-react';
import ViewAdapter from '@components/view-adapter';
import Redirect from '@components/redirect';

import HOCLoginMode from '@middleware/HOCLoginMode';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';

@inject('site')
class WXAuthorization extends React.Component {
  render() {
    return <ViewAdapter
              h5={<WXAuthorizationPage/>}
              pc={
                <Redirect jumpUrl={'/user/login'} />
              }
              title='授权登录'
            />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(HOCLoginMode('weixin')(WXAuthorization));
