import React from 'react';
import RebindPcPage from '@layout/user/h5/rebind';
import { inject } from 'mobx-react';
import ViewAdapter from '@components/view-adapter';

import HOCWithLogin from '@middleware/HOCWithLogin';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';

@inject('site')
class Rebind extends React.Component {
  render() {
    return <ViewAdapter
              h5={<RebindPcPage/>}
              pc={<RebindPcPage/>}
              title='微信换绑'
            />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(HOCWithLogin(Rebind));
