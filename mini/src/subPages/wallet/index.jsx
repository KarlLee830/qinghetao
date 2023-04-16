import React from 'react';
import { inject } from 'mobx-react';
import Taro, { getCurrentInstance } from '@tarojs/taro';
import Wallet from '../../layout/wallet/index';
import { readWalletUser } from '@server';
import Toast from '@discuzqsdk/design/dist/components/toast/index';

class WalletPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      walletData: null,
    };
    Taro.hideShareMenu();
  }

  setNavigationBarStyle = () => {
    Taro.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#000000',
    });
  };

  componentDidMount() {
    this.getWallet();
    this.setNavigationBarStyle();
  }

  getWallet = async () => {
    const res = await readWalletUser({ params: { uid: 1 } });
    if (res.code === 0) {
      await this.setState({ walletData: res.data });
    } else {
      Toast.error({
        content: res.msg,
        duration: 2000,
      });
    }
  };

  render() {
    return <Wallet walletData={this.state.walletData}></Wallet>;
  }
}

export default WalletPage;
