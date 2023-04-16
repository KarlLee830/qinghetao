import React from 'react';
import { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import Withdrawal from '@layout/wallet/withdrawal';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import { readWalletUser } from '@server';
import ViewAdapter from '@components/view-adapter';

@inject('site')
@observer
class WalletPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      walletData: null,
    };
  }

  async getWallet() {
    const res = await readWalletUser({ params: { uid: 1 } });
    if (res.code === 0) {
      await this.setState({ walletData: res.data });
    }
  }

  componentDidMount() {
    this.getWallet();
  }

  render() {
    return <ViewAdapter pc={null} h5={<Withdrawal walletData={this.state.walletData} />} title={`提现`} />;
  }
}

// eslint-disable-next-line new-cap
export default withRouter(HOCFetchSiteData(WalletPage));
