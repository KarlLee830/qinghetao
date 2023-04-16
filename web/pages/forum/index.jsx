import React from 'react';
import ForumPCPage from '@layout/forum/pc';
import ForumH5Page from '@layout/forum/h5';
import { withRouter } from 'next/router';
import { inject } from 'mobx-react';
import ViewAdapter from '@components/view-adapter';

import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCWithLogin from '@middleware/HOCWithLogin';

@inject('site')
class Forum extends React.Component {
  render() {
    return <ViewAdapter
              h5={<ForumH5Page />}
              pc={<ForumPCPage />}
              title={`站点信息`}
            />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(HOCWithLogin(withRouter(Forum)));
