import React from 'react';
import BindPhoneH5Page from '@layout/user/h5/bind-phone';
import { inject } from 'mobx-react';
import ViewAdapter from '@components/view-adapter';

import HOCLoginMode from '@middleware/HOCLoginMode';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';

@inject('site')
class BindPhone extends React.Component {
  render() {
    return <ViewAdapter
              h5={<BindPhoneH5Page />}
              pc={<BindPhoneH5Page />}
              title={`绑定手机号`}
            />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(HOCLoginMode('phone')(BindPhone));
