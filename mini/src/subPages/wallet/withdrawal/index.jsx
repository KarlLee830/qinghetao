import React from 'react';
import Withdrawal from '@layout/wallet/withdrawal';
import { readWalletUser } from '@server';
import Taro from '@tarojs/taro';
import Page from '@components/page';
import Toast from '@discuzqsdk/design/dist/components/toast/index';

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
    } else {
      Toast.error({
        content: res.msg,
        duration: 2000
      })
    }
  }

  setNavigationBarStyle = () => {
    Taro.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#000000',
    })
  }

  componentDidMount() {
    this.getWallet();
    this.setNavigationBarStyle();
  }

  render() {
    return (
      <Page>
        <Withdrawal walletData={this.state.walletData} />
      </Page>
    );
  }
}

// eslint-disable-next-line new-cap
export default WalletPage;
