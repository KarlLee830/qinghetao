import React from 'react';
import { withRouter } from 'next/router';
import Recharge from '@layout/wallet/recharge';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import ViewAdapter from '@components/view-adapter';

class RechargePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    return <ViewAdapter pc={null} h5={<Recharge />} title={`充值`} />;
  }
}

// eslint-disable-next-line new-cap
export default withRouter(HOCFetchSiteData(RechargePage));
