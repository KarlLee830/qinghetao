import React from 'react';
import Recharge from '@layout/wallet/recharge';
import { readWalletUser } from '@server';
import Taro from '@tarojs/taro';
import Page from '@components/page';
import Toast from '@discuzqsdk/design/dist/components/toast/index';

class WalletPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  setNavigationBarStyle = () => {
    Taro.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#000000',
    })
  }

  componentDidMount() {
    this.setNavigationBarStyle();
  }

  render() {
    return (
      <Page>
        <Recharge />
      </Page>
    );
  }
}

// eslint-disable-next-line new-cap
export default WalletPage;
