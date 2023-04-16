import React from 'react';
import { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import ViewAdapter from '@components/view-adapter';
import WalletH5Page from '@layout/wallet/h5';
import WalletPCPage from '@layout/wallet/pc';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import { readWalletUser } from '@server';

@inject('wallet')
@inject('site')
@observer
class WalletPage extends React.Component {
  static async getInitialProps(ctx) {
    try {
      const walletInfoServerRes = await readWalletUser({}, ctx);
      if (walletInfoServerRes.code === 0) {
        return {
          serverWalletInfo: walletInfoServerRes.data,
        };
      }
      return {
        serverWalletInfo: null,
      };
    } catch (error) {
      console.error(error);
      return {
        serverWalletInfo: null,
      };
    }
  }

  componentDidMount() {
    if (this.props.serverWalletInfo) {
      this.props.wallet.walletInfo = this.props.serverWalletInfo;
    } else {
      this.props.wallet.getUserWalletInfo();
    }
  }

  render() {
    const { site, wallet } = this.props;
    const { walletInfo } = wallet;
    return (
      <ViewAdapter
        h5={<WalletH5Page walletData={walletInfo} />}
        pc={<WalletPCPage walletData={walletInfo} />}
        title={`我的钱包`}
      />
    );
  }
}

// eslint-disable-next-line new-cap
export default withRouter(HOCFetchSiteData(WalletPage));
