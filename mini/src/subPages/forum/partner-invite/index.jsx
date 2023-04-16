import React from 'react';
import ParnerInviteH5Page from '@layout/forum/partner-invite';
import Taro from '@tarojs/taro';
import Page from '@components/page';

class ParnerInvite extends React.Component {
  componentDidMount() {
    // Taro.hideHomeButton();
  }
  render() {
    return (
      <Page>
        <ParnerInviteH5Page />
      </Page>
    );
  }
}

// eslint-disable-next-line new-cap
export default ParnerInvite;
