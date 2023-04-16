import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import UserCenterFans from '@components/user-center-fans';
import Divider from '@discuzqsdk/design/dist/components/divider/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import { View } from '@tarojs/components';
import Router from '@discuzqsdk/sdk/dist/router';
import { getCurrentInstance } from '@tarojs/taro';
import Page from '@components/page';
import styles from './index.module.scss';
import Taro from '@tarojs/taro';

@inject('user')
@observer
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      height: '100%',
      renderComponent: null,
    };
    this.props.user.cleanUserFans();
    this.props.user.cleanTargetUserFans();
    Taro.hideShareMenu();
  }

  componentDidMount() {
    this.setState({
      // header 是 40px，留出 2px ，用以触发下拉事件
      height: window.outerHeight - 38,
      renderComponent: true,
    });
  }

  getQueryString(key) {
    const routerParams = getCurrentInstance().router.params;

    return routerParams[key];
  }

  // 点击关注
  followHandler = async ({ id }) => {
    try {
      await this.props.user.postFollow(id);
      const isOtherFans = JSON.parse(this.getQueryString('isOtherPerson'));
      const isOtherFansId = this.getQueryString('otherId');
      if (isOtherFans) {
        this.props.user.setTargetUserFansBeFollowed(id);
      } else {
        this.props.user.setUserFansBeFollowed(id);
      }
      Toast.success({
        content: '关注成功',
        hasMask: false,
        duration: 1000,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // 取消关注
  unFollowHandler = async ({ id }) => {
    try {
      await this.props.user.cancelFollow({ id, type: 1 });
      const isOtherFans = JSON.parse(this.getQueryString('isOtherPerson'));
      if (isOtherFans) {
        this.props.user.setTargetUserFansBeUnFollowed(id);
      } else {
        this.props.user.setUserFansBeUnFollowed(id);
      }
      this.setState({
        renderComponent: this.getRenderComponent(),
      });
      Toast.success({
        content: '取消成功',
        hasMask: false,
        duration: 1000,
      });
    } catch (error) {
      console.log(error);
    }
  };

  onContainerClick = ({ id }) => {
    Router.push({ url: `/userPages/user/index?id=${id}` });
  };

  splitElement = () => (
    <View className={styles.splitEmelent}>
      <Divider />
    </View>
  );

  getRenderComponent = () => {
    const isOtherFans = JSON.parse(this.getQueryString('isOtherPerson'));
    const id = this.getQueryString('otherId');
    return (
      <>
        {!isOtherFans ? (
          <UserCenterFans onContainerClick={this.onContainerClick} splitElement={this.splitElement()} />
        ) : (
          <UserCenterFans userId={id} onContainerClick={this.onContainerClick} splitElement={this.splitElement()} />
        )}
      </>
    );
  };

  render() {
    return (
      <Page>
        <View
          style={{
            height: this.state.height,
          }}
        >
          {this.state.renderComponent && this.getRenderComponent()}
        </View>
      </Page>
    );
  }
}

export default index;
