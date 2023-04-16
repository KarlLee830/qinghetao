import React from 'react';
import { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import Frozen from '@layout/wallet/frozen';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import ViewAdapter from '@components/view-adapter';

@inject('site')
@observer
class FrozenPage extends React.Component {
  render() {
    return <ViewAdapter pc={null} h5={<Frozen />} title={`冻结金额`} />;
  }
}

// eslint-disable-next-line new-cap
export default withRouter(HOCFetchSiteData(FrozenPage));
