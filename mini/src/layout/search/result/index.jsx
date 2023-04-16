import React from 'react';
import { inject, observer } from 'mobx-react';

import SearchInput from '@components/search-input';
import BaseLayout from '@components/base-layout';
import ThreadContent from '@components/thread';
import SearchTopics from './components/search-topics';
import SearchUsers from './components/search-users';
import SidebarPanel from '@components/sidebar-panel';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import Taro from '@tarojs/taro';
import { getCurrentInstance } from '@tarojs/taro';

@inject('site')
@inject('search')
@observer
class SearchResultPage extends React.Component {
  constructor(props) {
    super(props);
    const { keyword = '' } = getCurrentInstance().router.params;

    this.state = {
      keyword,
    };

    // 进入页面时搜索
    // this.searchData(keyword);
  }

  redirectToSearchResultPost = () => {
    Taro.navigateTo({
      url: `/subPages/search/result-post/index?keyword=${this.state.keyword || ''}`
    })
  };

  redirectToSearchResultUser = () => {
    Taro.navigateTo({
      url: `/subPages/search/result-user/index?keyword=${this.state.keyword || ''}`
    })
  };

  redirectToSearchResultTopic = () => {
    Taro.navigateTo({
      url: `/subPages/search/result-topic/index?keyword=${this.state.keyword || ''}`
    })
  };

  onCancel = () => {
    Taro.navigateBack({ delta: 1});
  };

  searchData = (keyword) => {
    const { dispatch } = this.props;
    dispatch('search', keyword);
  };

  onSearch = (keyword) => {
    this.setState({ keyword }, () => {
      this.searchData(keyword);
    });
  };

  onUserClick = (userId) => {
    Taro.navigateTo({url: `/userPages/user/index?id=${userId}`});
  };

  onTopicClick = data => console.log('topic click', data);

  // 跳转话题详情
  onTopicClick = data => {
    const { topicId = '' } = data
    Taro.navigateTo({url: `/subPages/topic/topic-detail/index?id=${topicId}`})
  };

  render() {
    const { keyword } = this.state;

    const { searchTopics, searchUsers, searchThreads, searchTopicsError, searchUsersError, searchThreadsError, indexThreadsLoading } = this.props.search;
    const { pageData: topicsPageData } = searchTopics || {};
    const { pageData: usersPageData } = searchUsers || {};
    const { pageData: threadsPageData } = searchThreads || {};

    const { hasTopics, hasUsers, hasThreads, isShowAll } = this.props.search.dataSearchStatus

    return (
      <BaseLayout allowRefresh={false} showHeader={false}>
        <SearchInput onSearch={this.onSearch} onCancel={this.onCancel} defaultValue={keyword} searchWhileTyping/>

        {(isShowAll || hasUsers) && <SidebarPanel
          title="用户"
          onShowMore={this.redirectToSearchResultUser}
          isLoading={!usersPageData}
          noData={!usersPageData?.length}
          platform='h5'
          isError={searchUsersError.isError}
          errorText={searchUsersError.errorText}
          titleStyle={{ border: "none" }}
        >
          {
            usersPageData?.length && <SearchUsers data={usersPageData} onItemClick={this.onUserClick} />
          }
        </SidebarPanel>}

        {(isShowAll || hasThreads) && <SidebarPanel
          title="主题"
          onShowMore={this.redirectToSearchResultPost}
          isLoading={indexThreadsLoading}
          noData={!threadsPageData?.length}
          platform='h5'
          className={threadsPageData?.length && styles.bottom}
          isError={searchThreadsError.isError}
          errorText={searchThreadsError.errorText}
          titleStyle={{ border: "none" }}
          mold='plane'
        >
          {
            threadsPageData?.filter((_, index) => index < 3).map((item, index) => <ThreadContent data={item} key={index} />)
          }
        </SidebarPanel>}

        {(isShowAll || hasTopics) && <SidebarPanel
          title="话题"
          onShowMore={this.redirectToSearchResultTopic}
          isLoading={!topicsPageData}
          noData={!topicsPageData?.length}
          platform='h5'
          isError={searchTopicsError.isError}
          errorText={searchTopicsError.errorText}
          titleStyle={{ border: "none" }}
        >
          {
            topicsPageData?.length && <SearchTopics data={topicsPageData} onItemClick={this.onTopicClick} />
          }
        </SidebarPanel>}
      </BaseLayout>
    );
  }
}

export default SearchResultPage;
