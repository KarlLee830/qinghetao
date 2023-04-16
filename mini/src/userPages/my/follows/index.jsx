import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Router from '@discuzqsdk/sdk/dist/router';
import { View } from '@tarojs/components';
import { getCurrentInstance } from '@tarojs/taro';
import UserCenterFollows from '@components/user-center-follow';
import Divider from '@discuzqsdk/design/dist/components/divider/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
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
    this.props.user.cleanUserFollows();
    this.props.user.cleanTargetUserFollows();
    Taro.hideShareMenu();
  }

  componentDidMount() {
    this.setState({
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
      Toast.success({
        content: '关注成功',
        hasMask: false,
        duration: 1000,
      });
      const isOtherFollows = JSON.parse(this.getQueryString('isOtherPerson'));
      if (isOtherFollows) {
        const isOtherFollowId = this.getQueryString('otherId');
        this.props.user.setTargetUserFollowerBeFollowed(isOtherFollowId);
      } else {
        this.props.user.setUserFollowerBeFollowed(id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 取消关注
  unFollowHandler = async ({ id }) => {
    try {
      await this.props.user.cancelFollow({ id, type: 1 });
      const isOtherFollows = JSON.parse(this.getQueryString('isOtherPerson'));
      const isOtherFollowId = this.getQueryString('otherId');
      if (isOtherFollows) {
        this.props.user.setTargetUserFollowerBeUnFollowed(isOtherFollowId);
      } else {
        this.props.user.setUserFollowerBeUnFollowed(id);
      }
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

  // 分割线
  splitElement = () => (
    <View className={styles.splitEmelent}>
      <Divider />
    </View>
  );

  getRenderComponent() {
    const isOtherFollows = JSON.parse(this.getQueryString('isOtherPerson'));
    const id = this.getQueryString('otherId');
    return (
      <>
        {!isOtherFollows ? (
          <UserCenterFollows onContainerClick={this.onContainerClick} splitElement={this.splitElement()} />
        ) : (
          <UserCenterFollows onContainerClick={this.onContainerClick} userId={id} splitElement={this.splitElement()} />
        )}
      </>
    );
  }

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
