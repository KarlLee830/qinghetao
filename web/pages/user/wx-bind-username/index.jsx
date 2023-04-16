import React from 'react';
import WXBindUsernameH5Page from '@layout/user/h5/wx-bind-username';
import { inject } from 'mobx-react';
import ViewAdapter from '@components/view-adapter';
import Redirect from '@components/redirect';

import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCLoginMode from '@middleware/HOCLoginMode';

@inject('site')
class WXBindUsername extends React.Component {
  render() {
    return <ViewAdapter
              h5={<WXBindUsernameH5Page/>}
              pc={
                <Redirect jumpUrl={'/user/login'} />
              }
              title={`微信绑定用户名`}
            />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(HOCLoginMode('weixin')(WXBindUsername));
