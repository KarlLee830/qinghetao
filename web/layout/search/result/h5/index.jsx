/** 
 * 页面用于渲染 http://localhost:9527/search/result?keyword=
 * 
 * */ 
import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import BaseLayout from '@components/base-layout';
import SearchInput from '@components/search-input';
import SidebarPanel from '@components/sidebar-panel';

import SearchPosts from './components/search-posts';
import SearchTopics from './components/search-topics';
import SearchUsers from './components/search-users';

import styles from './index.module.scss';

@inject('site')
@inject('search')
@observer
class SearchResultH5Page extends React.Component {
  constructor(props) {
    super(props);

    const keyword = this.props.router.query.keyword || '';

    this.state = {
      keyword,
    };

    // 进入页面时搜索
    // this.searchData(keyword);
  }

  redirectToSearchResultPost = () => {
    this.props.search.currentPostKeyword = this.state.keyword;
    this.props.router.push(`/search/result-post?keyword=${this.state.keyword || ''}`);
  };

  redirectToSearchResultUser = () => {
    this.props.search.currentUserKeyword = this.state.keyword;
    this.props.router.push(`/search/result-user?keyword=${this.state.keyword || ''}`);
  };

  redirectToSearchResultTopic = () => {
    this.props.search.currentTopicKeyword = this.state.keyword;
    this.props.router.push(`/search/result-topic?keyword=${this.state.keyword || ''}`);
  };

  onCancel = () => {
    this.props.router.back();
  };

  searchData = (keyword) => {
    const { dispatch } = this.props;
    dispatch('search', keyword);
  };

  onSearch = (keyword) => {
    // query 更新
    this.props.router.replace(`/search/result?keyword=${keyword}`);
    this.setState({ keyword }, () => {
      this.searchData(keyword);
    });
  };

  onUserClick = (userId) => {
    this.props.router.push(`/user/${userId}`);
  };

  // 跳转话题详情
  onTopicClick = data => {
    const { topicId = '' } = data
    this.props.router.push(`/topic/topic-detail/${topicId}`)
  };

  componentDidMount() {
    this.props.search.resetResultData(); // 清空结果列表页缓存
  }

  render() {
    const { keyword } = this.state;
    const { searchTopics, searchUsers, searchThreads, searchTopicsError, searchUsersError, searchThreadsError, indexThreadsLoading } = this.props.search;
    const { pageData: topicsPageData } = searchTopics || {};
    const { pageData: usersPageData } = searchUsers || {};
    const { pageData: threadsPageData } = searchThreads || {};

    const { hasTopics, hasUsers, hasThreads, isShowAll } = this.props.search.dataSearchStatus

    return (
      <BaseLayout allowRefresh={false} pageName="h5SearchResult">
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
        >
          {
            threadsPageData?.length &&<SearchPosts data={threadsPageData.filter((_, index) => index < 3)} onItemClick={this.onPostClick} />
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

export default withRouter(SearchResultH5Page);
