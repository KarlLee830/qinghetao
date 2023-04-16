import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Header from '@components/header';
import UserCenterFllows from '@components/user-center-follow';
import { Divider, Toast } from '@discuzqsdk/design';
import styles from './index.module.scss';
import Router from '@discuzqsdk/sdk/dist/router';
import { withRouter } from 'next/router';
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
    this.props.user.cleanUserFollows();
    this.props.user.cleanTargetUserFollows();
  }

  componentDidMount() {
    this.setState({
      height: window.outerHeight - 38,
      renderComponent: true,
    });
  }

  getFlag() {
    const isOtherPersonQuery = GetQueryString('isOtherPerson');

    if (!isOtherPersonQuery) {
      this.isOtherFollows = false;
      return;
    }

    this.isOtherFollows = JSON.parse(isOtherPersonQuery);
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
      const { isOtherFollows } = this;
      if (isOtherFollows) {
        const isOtherFollowId = GetQueryString('otherId');
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
      const { isOtherFollows } = this;
      const isOtherFollowId = GetQueryString('otherId');
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
    Router.push({ url: `/user/${id}` });
  };

  // 分割线
  splitElement = () => (
    <div className={styles.splitEmelent}>
      <Divider />
    </div>
  );

  getRenderComponent() {
    const { isOtherFollows } = this;
    const id = GetQueryString('otherId');
    return (
      <>
        {!isOtherFollows ? (
          <UserCenterFllows onContainerClick={this.onContainerClick} splitElement={this.splitElement()} />
        ) : (
          <UserCenterFllows onContainerClick={this.onContainerClick} userId={id} splitElement={this.splitElement()} />
        )}
      </>
    );
  }

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
        title={'关注列表'}
      />
    );
  }
}

export default withRouter(index);
