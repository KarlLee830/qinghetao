import React from 'react';
import SidebarPanel from '@components/sidebar-panel';
import UserCenterFans from '@components/user-center-fans';
import UserCenterFansPopup from '@components/user-center-fans-popup';
import { inject, observer } from 'mobx-react';
import Router from '@discuzqsdk/sdk/dist/router';
import styles from './index.module.scss';
import { withRouter } from 'next/router';
import classnames from 'classnames';

@inject('user')
@observer
class UserCenterFansPc extends React.Component {
  static defaultProps = {
    className: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      showFansPopup: false,
      dataSource: {},
      sourcePage: 1,
      sourceTotalPage: 1,
    };
  }

  componentDidMount = () => {
    if (this.props.getRef) {
      this.props.getRef(this);
    }
  }

  closePopup = () => {
    this.setState({
      showFansPopup: false,
    });
  }

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

  // 点击粉丝更多
  moreFans = () => {
    this.setState({ showFansPopup: true });
  };

  render() {
    let fansCount = 0;
    if (this.props.userId) {
      if (this.props.userId === this.props.user?.id) {
        fansCount = this.props.user.fansCount;
      } else {
        fansCount = this.props.user.targetUsers[this.props.userId]?.fansCount;
      }
    } else {
      fansCount = this.props.user.fansCount;
    }


    return (
      <>
        <SidebarPanel
          type="normal"
          platform={'h5'}
          titleWrapper={styles.titleWrapper}
          noData={Number(fansCount) === 0}
          title="粉丝"
          leftNum={fansCount}
          onShowMore={this.moreFans}
          mold={'wrapper'}
          className={`${this.props.className} ${styles.borderRadius}`}
        >
          <div>
            {Number(fansCount) !== 0 && (
              <UserCenterFans
                style={{
                  overflow: 'hidden',
                }}
                dataSource={this.state.dataSource}
                setDataSource={this.setDataSource}
                sourcePage={this.state.sourcePage}
                updateSourcePage={this.updateSourcePage}
                sourceTotalPage={this.state.sourceTotalPage}
                updateSourceTotalPage={this.updateSourceTotalPage}
                userId={this.props.userId}
                onContainerClick={({ id }) => {
                  this.props.router.push({
                    pathname: '/user/[id]',
                    query: {
                      id,
                    },
                  });
                }}
                itemStyle={{
                  paddingLeft: 0,
                  paddingRight: 0,
                  paddingTop: 8,
                  paddingBottom: 8,
                }}
                className={classnames(styles.friendsWrapper, styles.fansWrapper)}
                limit={5}
              />
            )}
          </div>
        </SidebarPanel>

        <UserCenterFansPopup
          id={this.props.userId}
          visible={this.state.showFansPopup}
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
          onClose={() => this.setState({ showFansPopup: false })}
        />
      </>
    );
  }
}

export default withRouter(UserCenterFansPc);
