import React from 'react';
import ActiveUsers from '@layout/search/pc/components/active-users';
import SidebarPanel from '@components/sidebar-panel';
import { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';

@inject('search')
@observer
class Index extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    users: null,
    isError: false,
    errorText: '加载失败'
  }

  componentDidMount() {
    this.loadData();
  }

  redirectToSearchResultUser = () => {
    this.props.router.push('/search/result-user');
  }

  onUserClick = ({ userId } = {}) => {
    this.props.router.push(`/user/${userId}`);
  };

  loadData = async () => {
    const hasUsers = !!this.props.search.users;
    if(hasUsers) {
      this.setState({
        users: this.props.search.users,
      });
      return ;
    }
    try {
      const res = await this.props.search.getUsersList();
      if (res && res.code === 0 && res.data) {
        this.setState({
          users: res.data,
        });
      }
    } catch (error) {
      this.setState({
        isError: true,
        errorText: error
      });
    }
  }

  render() {
    const { pageData } = this.state.users || {};
    const { topicsError } = this.props.search || {};
    const { isError, errorText } = this.state
    const { className = '' } = this.props;

    return (
      <SidebarPanel
        title="活跃用户"
        onShowMore={this.redirectToSearchResultUser}
        isLoading={!pageData}
        noData={!pageData?.length}
        isError={topicsError.isError || isError}
        errorText={topicsError.errorText || errorText}
        className={className}
      >
        <ActiveUsers data={pageData} direction='left' onItemClick={this.onUserClick}/>
      </SidebarPanel>
    );
  }
}

export default withRouter(Index);
