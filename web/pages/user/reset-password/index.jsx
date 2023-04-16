import React from 'react';
import ResetPasswordH5Page from '@layout/user/h5/reset-password';
import { inject } from 'mobx-react';
import ViewAdapter from '@components/view-adapter';

import HOCLoginMode from '@middleware/HOCLoginMode';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';

@inject('site')
class ResetPassword extends React.Component {
  render() {
    return <ViewAdapter
              h5={<ResetPasswordH5Page/>}
              pc={<ResetPasswordH5Page/>}
              title={`找回密码`}
            />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(HOCLoginMode('phone')(ResetPassword));
