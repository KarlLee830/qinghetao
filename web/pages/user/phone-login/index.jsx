import React from 'react';
import LoginPhoneH5Page from '@layout/user/h5/phone-login';
import { inject } from 'mobx-react';
import ViewAdapter from '@components/view-adapter';

import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCWithNoLogin from '@middleware/HOCWithNoLogin';
import HOCLoginMode from '@middleware/HOCLoginMode';

@inject('site')
class LoginPhone extends React.Component {
  render() {
    return <ViewAdapter
              h5={<LoginPhoneH5Page/>}
              pc={<LoginPhoneH5Page/>}
              title={`手机号登录`}
            />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(HOCWithNoLogin(HOCLoginMode('phone')(LoginPhone)));
