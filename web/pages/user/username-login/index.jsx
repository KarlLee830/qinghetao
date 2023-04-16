import React from 'react';
import UsernameH5Login from '@layout/user/h5/username-login';
import { inject } from 'mobx-react';
import ViewAdapter from '@components/view-adapter';

import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCWithNoLogin from '@middleware/HOCWithNoLogin';

@inject('site')
class UsernameLogin extends React.Component {
  render() {
    return <ViewAdapter
              h5={<UsernameH5Login/>}
              pc={<UsernameH5Login/>}
              title={`用户名登录`}
            />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(HOCWithNoLogin(UsernameLogin));
