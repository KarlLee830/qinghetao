import React from 'react';
import InviteH5Page from '@layout/invite';
import Page from '@components/page';
import withShare from '@common/utils/withShare/withShare';
import Taro from '@tarojs/taro';

@withShare({})
class Invite extends React.Component {
  // 配置邀请好友地址
  getShareData(data) {

    console.log(data);
    return {
      path: data.path,
      title: data.title,
    };
  }

  setNavigationBarStyle = () => {
    Taro.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#ffffff'
    });
  }

  componentDidMount() {
    this.setNavigationBarStyle();
  }

  render() {
    return (
      <Page>
        <InviteH5Page />
      </Page>
    );
  }
}

// eslint-disable-next-line new-cap
export default Invite;
