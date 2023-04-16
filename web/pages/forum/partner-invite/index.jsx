import React from 'react';
import ParnerInviteH5Page from '@layout/forum/h5/partner-invite';
import { withRouter } from 'next/router';
import { inject } from 'mobx-react';
import ViewAdapter from '@components/view-adapter';

import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCWithNoPaid from '@middleware/HOCWithNoPaid';

@inject('site')
class ParnerInvite extends React.Component {
  render() {
    return <ViewAdapter
              h5={<ParnerInviteH5Page />}
              pc={<ParnerInviteH5Page />}
              title="站点加入"
            />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(HOCWithNoPaid(withRouter(ParnerInvite)));
