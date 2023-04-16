import React from 'react';
import StatusH5Page from '@layout/user/h5/status';
import { inject } from 'mobx-react';
import ViewAdapter from '@components/view-adapter';

import HOCFetchSiteData from '@middleware/HOCFetchSiteData';

@inject('site')
class Status extends React.Component {
  render() {
    return <ViewAdapter
              h5={<StatusH5Page/>}
              pc={<StatusH5Page/>}
              title={`账号审核状态`}
            />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(Status);
