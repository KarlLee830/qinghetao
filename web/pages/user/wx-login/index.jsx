import React from 'react';
import WXLoginH5Page from '@layout/user/h5/wx-login';
import { inject } from 'mobx-react';
import ViewAdapter from '@components/view-adapter';

import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCLoginMode from '@middleware/HOCLoginMode';
import HOCWeixin from '@middleware/HOCWeixin';
import HOCWithNoLogin from '@middleware/HOCWithNoLogin';

@inject('site')
class WXLogin extends React.Component {
  render() {
    return <ViewAdapter
              h5={<WXLoginH5Page/>}
              pc={<WXLoginH5Page/>}
              title='微信登录'
            />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(HOCWithNoLogin(HOCLoginMode('weixin')(HOCWeixin(WXLogin))));
