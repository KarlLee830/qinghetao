import React from 'react';
import WXSelectH5Page from '@layout/user/h5/wx-select';
import { inject } from 'mobx-react';
import ViewAdapter from '@components/view-adapter';
import Redirect from '@components/redirect';

import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCLoginMode from '@middleware/HOCLoginMode';
import HOCWithNoLogin from '@middleware/HOCWithNoLogin';

@inject('site')
class WXSelect extends React.Component {
  render() {
    return <ViewAdapter
              h5={<WXSelectH5Page/>}
              pc={
                <Redirect jumpUrl={'/user/login'} />
              }
              title='微信绑定'
            />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(HOCWithNoLogin(HOCLoginMode('weixin')(WXSelect)));
