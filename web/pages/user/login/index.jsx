import React from 'react';
import H5Login from '@layout/user/h5/login';
import { inject } from 'mobx-react';
import { withRouter } from 'next/router';
import ViewAdapter from '@components/view-adapter';

import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCWithNoLogin from '@middleware/HOCWithNoLogin';

@inject('site')
class Login extends React.Component {
  render() {
    return <ViewAdapter
              h5={<H5Login/>}
              pc={<H5Login/>}
              title={`登录`}
            />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(HOCWithNoLogin(withRouter(Login)));
