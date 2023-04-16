import React from 'react';
import SidebarPanel from '@components/sidebar-panel';
import UserCenterFollowPopup from '@components/user-center-follow-popup';
import { inject, observer } from 'mobx-react';
import Router from '@discuzqsdk/sdk/dist/router';
import styles from './index.module.scss';
import UserCenterFollows from '../../user-center-follow';
import { withRouter } from 'next/router';
import classnames from 'classnames';

@inject('user')
@observer
class UserCenterFollowsPc extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showFollowsPopup: false,
      dataSource: {},
      sourcePage: 1,
      sourceTotalPage: 1,
    };
  }

  static defaultProps = {
    showMore: true,
    withLimit: 5,
    className: '',
    messageMode: false,
    style: {},
  };


  componentDidMount = () => {
    if (this.props.getRef) {
      this.props.getRef(this);
    }
  }

  closePopup = () => {
    this.setState({
      showFollowsPopup: false,
    });
  }

  // 点击粉丝更多
  moreFollow = () => {
    this.setState({ showFollowsPopup: true });
  };

  setDataSource = (targetData) => {
    this.setState({
      dataSource: targetData,
    });
  };

  updateSourcePage = (newPage) => {
    this.setState({
      sourcePage: newPage,
    });
  };

  updateSourceTotalPage = (newTotalPage) => {
    this.setState({
      sourceTotalPage: newTotalPage,
    });
  };

  render() {
    let followCount = 0;
    if (this.props.userId) {
      if (this.props.userId === this.props.user?.id) {
        followCount = this.props.user.followCount;
      } else {
        followCount = this.props.user.targetUsers[this.props.userId]?.followCount;
      }
    } else {
      followCount = this.props.user.followCount;
    }

    const UserCenterFollowsStyle = {
      overflow: 'hidden',
      ...this.props.style,
    };
    return (
      <>
        <SidebarPanel
          platform={'h5'}
          type="normal"
          noData={Number(followCount) === 0}
          title="关注"
          mold={'wrapper'}
          messageMode={this.props.messageMode}
          leftNum={followCount}
          isShowMore={this.props.showMore}
          onShowMore={this.moreFollow}
          className={`${this.props.className} ${styles.borderRadius}`}
        >
          <div className={classnames(styles.followsWrapper, this.props.className)}>
            {Number(followCount) !== 0 && (
              <UserCenterFollows
                style={UserCenterFollowsStyle}
                dataSource={this.state.dataSource}
                setDataSource={this.setDataSource}
                sourcePage={this.state.sourcePage}
                updateSourcePage={this.updateSourcePage}
                sourceTotalPage={this.state.sourceTotalPage}
                updateSourceTotalPage={this.updateSourceTotalPage}
                messageMode={this.props.messageMode}
                userId={this.props.userId}
                onContainerClick={({ id }) => {
                  this.props.router.push({
                    pathname: '/user/[id]',
                    query: {
                      id,
                    },
                  });
                }}
                itemStyle={{ padding: this.props.messageMode ? '8px 16px' : '8px 0' }}
                className={this.props.messageMode ? styles.friendsWrapperScroll : styles.friendsWrapper}
                limit={this.props.withLimit}
              />
            )}
          </div>
        </SidebarPanel>

        {this.props.showMore && (
          <UserCenterFollowPopup
            id={this.props.userId}
            visible={this.state.showFollowsPopup}
            dataSource={this.state.dataSource}
            setDataSource={this.setDataSource}
            sourcePage={this.state.sourcePage}
            updateSourcePage={this.updateSourcePage}
            sourceTotalPage={this.state.sourceTotalPage}
            updateSourceTotalPage={this.updateSourceTotalPage}
            onContainerClick={({ id }) => {
              this.props.router.push({
                pathname: '/user/[id]',
                query: {
                  id,
                },
              });
            }}
            onClose={() => this.setState({ showFollowsPopup: false })}
          />
        )}
      </>
    );
  }
}

export default withRouter(UserCenterFollowsPc);
