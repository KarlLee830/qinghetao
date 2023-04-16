import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Header from '@components/header';
import UserCenterFans from '@components/user-center-fans';
import { Divider, Toast } from '@discuzqsdk/design';
import styles from './index.module.scss';
import { withRouter } from 'next/router';
import Router from '@discuzqsdk/sdk/dist/router';
import GetQueryString from '../../../../common/utils/get-query-string';
import ViewAdapter from '@components/view-adapter';
import Redirect from '@components/redirect';

@inject('user')
@observer
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      height: '100%',
      renderComponent: null,
    };

    this.getFlag();

    this.props.user.cleanUserFans();
    this.props.user.cleanTargetUserFans();
  }

  componentDidMount() {
    this.setState({
      // header 是 40px，留出 2px ，用以触发下拉事件
      height: window.outerHeight - 38,
      renderComponent: true,
    });
  }

  getFlag() {
    const isOtherPersonQuery = GetQueryString('isOtherPerson');

    if (!isOtherPersonQuery) {
      this.isOtherFans = false;
      return;
    }

    this.isOtherFans = JSON.parse(isOtherPersonQuery);
  }

  // 点击关注
  followHandler = async ({ id }) => {
    try {
      await this.props.user.postFollow(id);
      const { isOtherFans } = this;

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
      const { isOtherFans } = this;

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
    Router.push({ url: `/user/${id}` });
  };

  splitElement = () => (
    <div className={styles.splitEmelent}>
      <Divider />
    </div>
  );

  getRenderComponent = () => {
    const { isOtherFans } = this;

    const id = GetQueryString('otherId');

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
      <ViewAdapter
        h5={
          <div
            style={{
              height: this.state.height,
            }}
          >
            <Header />
            {this.state.renderComponent && this.getRenderComponent()}
          </div>
        }
        pc={<Redirect jumpUrl={'/my'} />}
        title={'粉丝列表'}
      />
    );
  }
}

export default withRouter(index);
