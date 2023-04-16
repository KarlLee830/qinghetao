import React from 'react';
import WXBindPhoneH5Page from '@layout/user/h5/wx-bind-phone';
import { inject } from 'mobx-react';
import ViewAdapter from '@components/view-adapter';
import Redirect from '@components/redirect';

import HOCLoginMode from '@middleware/HOCLoginMode';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';

@inject('site')
class WXBindPhone extends React.Component {
  render() {
    return <ViewAdapter
              h5={<WXBindPhoneH5Page/>}
              pc={
                <Redirect jumpUrl={'/user/login'} />
              }
              title={`微信绑定手机号`}
            />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(HOCLoginMode('weixin')(WXBindPhone));
