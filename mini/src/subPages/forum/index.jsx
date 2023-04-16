import React from 'react';
import ForumH5Page from '@layout/forum/index';
import Taro from '@tarojs/taro';
import Page from '@components/page';


class Forum extends React.Component {

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
        <ForumH5Page />
      </Page>
    );
  }
}

// eslint-disable-next-line new-cap
export default Forum;
