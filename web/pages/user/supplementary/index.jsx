import React from 'react';
import SupplementaryPage from '@layout/user/h5/supplementary';
import { inject } from 'mobx-react';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import ViewAdapter from '@components/view-adapter';

@inject('site')
class Supplementary extends React.Component {
  render() {
    return <ViewAdapter
              h5={<SupplementaryPage/>}
              pc={<SupplementaryPage/>}
              title={`补充信息`}
            />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(Supplementary);
