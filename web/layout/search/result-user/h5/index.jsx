import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import SearchInput from '@components/search-input';
import BaseLayout from '@components/base-layout';
import UserItem from '@components/thread/user-item';

import styles from './index.module.scss';

@inject('site')
@inject('search')
@inject('baselayout')
@observer
class SearchResultUserH5Page extends React.Component {
  constructor(props) {
    super(props);

    const keyword = this.props.router.query.keyword || this.props.search.currentUserKeyword || ''; // url中的关键词参数优先

    this.state = {
      keyword,
      refreshing: false,
    };
  }

  // data
  refreshData = () => {
    const { dispatch } = this.props;
    const { keyword } = this.state;
    dispatch('refresh', keyword);
  };

  fetchMoreData = () => {
    const { dispatch } = this.props;
    const { keyword } = this.state;
    return dispatch('moreData', keyword);
  };

  // event
  onCancel = () => {
    this.props.router.back();
  };

  onSearch = (keyword) => {
    // this.props.search.currentUserKeyword = keyword;
    this.props.router.replace(`/search/result-user?keyword=${keyword}`);
    this.setState({ keyword }, () => {
      this.refreshData();
    });
  };

  onUserClick = (id) => {
    this.props.router.push(`/user/${id}`);
  };

  async componentDidMount() {
    const { search, router, baselayout } = this.props;
    const { keyword = '' } = router.query;
    // 当服务器无法获取数据时，触发浏览器渲染
    const hasUsers = !!search.users;

    if (!hasUsers || (keyword && keyword !== search.currentUserKeyword)) { // 缓存为空或者url参数与缓存不同，刷新；否则，有缓存的关键词，需要回到原来位置
      this.page = 1;
      search.resetResultData();
      baselayout.resultUser = -1;
      await search.getUsersList({ search: keyword, perPage: this.perPage });
    }
  }

  render() {
    const { keyword } = this.state;
    const { users, usersError } = this.props.search;
    const { pageData = [], currentPage, totalPage } = users || { pageData: [] };

    return (
      <BaseLayout
        onRefresh={this.fetchMoreData}
        noMore={currentPage >= totalPage}
        requestError={usersError.isError}
        errorText={usersError.errorText}
        pageName="resultUser"
      >
        <SearchInput onSearch={this.onSearch} onCancel={this.onCancel} defaultValue={keyword} searchWhileTyping/>
        {
          pageData?.map((item, index) => (
            <UserItem
              key={index}
              title={item.nickname}
              imgSrc={item.avatar}
              label={item.groupName}
              groupLevel={item.level}
              userId={item.userId}
              onClick={this.onUserClick}
              className={styles.userItem}
            />
          ))
        }
      </BaseLayout>
    );
  }
}

export default withRouter(SearchResultUserH5Page);
