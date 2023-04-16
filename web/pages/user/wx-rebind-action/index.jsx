import React from 'react';
import WXRebindActionPage from '@layout/user/h5/wx-rebind-action';
import { inject } from 'mobx-react';
import ViewAdapter from '@components/view-adapter';
import Redirect from '@components/redirect';

import HOCLoginMode from '@middleware/HOCLoginMode';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';

@inject('site')
class WXRebindAction extends React.Component {
  render() {
    return <ViewAdapter
              h5={<WXRebindActionPage/>}
              pc={
                <Redirect jumpUrl={'/user/login'} />
              }
              title='换绑授权'
            />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(HOCLoginMode('weixin')(WXRebindAction));
