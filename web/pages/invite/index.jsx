import React from 'react';
import InvitePCPage from '@layout/invite/pc';
import InviteH5Page from '@layout/invite/h5';
import { inject } from 'mobx-react';
import { withRouter } from 'next/router';
import ViewAdapter from '@components/view-adapter';

import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCWithLogin from '@middleware/HOCWithLogin';

@inject('site')
class Invite extends React.Component {
  render() {
    return <ViewAdapter
              h5={<InviteH5Page />}
              pc={<InvitePCPage />}
              title={`推广邀请`}
            />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(HOCWithLogin(withRouter(Invite)));
