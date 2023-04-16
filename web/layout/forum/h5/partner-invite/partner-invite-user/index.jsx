import React from 'react';
import { inject, observer } from 'mobx-react';
import SectionTitle from '@components/section-title';
import NoData from '@components/no-data';
import { simpleRequest } from '@common/utils/simple-request';
import { Spin, Toast } from '@discuzqsdk/design';
import ActiveUsers from '../../../../search/h5/components/active-users';
import ActiveUsersMore from '../../../../search/pc/components/active-users-more';
import layout from './index.module.scss';

@inject('site')
@inject('index')
@inject('forum')
@inject('search')
@inject('user')
@inject('invite')
@observer
class PartnerInviteUser extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      isLoading: true
    }
  }
  async componentDidMount() {
    const { forum, site } = this.props;
    const { platform } = site;
    try {
      const perPage = platform === 'pc' ? 5 : 20;

      const usersList = await simpleRequest('readUsersList', {
        params: {
          perPage,
          filter: {
            hot: 1,
          },
        },
      });
      forum.setUsersPageData(usersList);
      this.setState({isLoading: false})
    } catch (e) {
      Toast.error({
        content: e?.Message || e,
        hasMask: false,
        duration: 1000,
      });
    }
  }
  render() {
    const { site, forum, onUserClick = () => {} } = this.props;
    const { platform } = site;
    const { isLoading } = this.state;
    const { usersPageData = [], threadsPageData = [] } = forum;
    if (platform === 'h5') {
      return (
        <div className={layout.users}>
        <SectionTitle isShowMore={false} icon={{ type: 2, name: 'MemberOutlined' }} title="活跃用户"/>
          {
            !isLoading && usersPageData?.length
              ? <ActiveUsers data={usersPageData} onItemClick={onUserClick} />
              : <></>
          }
          {
            !isLoading && !usersPageData?.length
              ? <NoData />
              : <></>
          }
          {
            isLoading
              ? <div className={layout.spinner}>
                  <Spin type="spinner" />
                </div>
              : <></>
          }
        </div>
      )
    }
    return (
      <div className={layout.pc_users}>
      <SectionTitle titleStyle={platform === 'pc' ? { padding: '24px 0' } : {}} isShowMore={false} icon={{ type: 2, name: 'MemberOutlined' }} title="活跃用户" />
        {
          !isLoading && usersPageData?.length
            ? <ActiveUsersMore data={usersPageData} onItemClick={onUserClick} noOperation/>
            : <></>
        }
        {
          !isLoading && !usersPageData?.length
            ? <NoData />
            : <></>
        }
        {
          isLoading
            ? <div className={layout.spinner}>
                <Spin type="spinner" />
              </div>
            : <></>
        }
      </div>
    );
  }
}

export default PartnerInviteUser;
