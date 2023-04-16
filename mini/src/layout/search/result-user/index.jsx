import React from 'react';
import { inject, observer } from 'mobx-react';
import SearchInput from '@components/search-input';
import BaseLayout from '@components/base-layout';
import UserItem from '@components/thread/user-item';
import Taro, { getCurrentInstance } from '@tarojs/taro';

import styles from './index.module.scss';
@inject('site')
@inject('search')
@observer
class SearchResultUserH5Page extends React.Component {
  constructor(props) {
    super(props);

    const { keyword = '' } = getCurrentInstance().router.params;

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
    Taro.navigateBack()
  };

  onSearch = (keyword) => {
    this.setState({ keyword }, () => {
      this.refreshData();
    });
  };

  onUserClick = (userId) => {
    Taro.navigateTo({url: `/userPages/user/index?id=${userId}`});
  };

  render() {
    const { keyword } = this.state;
    const { users, usersError } = this.props.search;
    const { pageData = [], currentPage, totalPage } = users || {};

    return (
      <BaseLayout
        onRefresh={this.fetchMoreData}
        noMore={currentPage >= totalPage}
        showHeader={false}
        requestError={usersError.isError}
        errorText={usersError.errorText}
        showLoadingInCenter={!pageData?.length}
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
              onClick={this.onUserClick}
              className={styles.userItem}
              userId={item.userId}
            />
          ))
        }
      </BaseLayout>
    );
  }
}

export default SearchResultUserH5Page;
