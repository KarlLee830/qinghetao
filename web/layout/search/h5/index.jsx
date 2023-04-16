import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import SearchInput from '@components/search-input';
import TrendingTopics from '@components/search/trending-topic-items';
import ActiveUsers from '@components/search/active-user-items';
import BaseLayout from '@components/base-layout';
import ThreadContent from '@components/thread';
import SidebarPanel from '@components/sidebar-panel';

@inject('site')
@inject('search')
@inject('baselayout')
@observer
class SearchH5Page extends React.Component {
  onSearch = (keyword) => {
    this.props.search.currentKeyword = keyword;
    this.props.router.push(`/search/result?keyword=${keyword || ''}`);
  };

  redirectToSearchResultPost = () => {
    this.props.router.push('/search/result-post');
  };

  redirectToSearchResultUser = () => {
    this.props.router.push('/search/result-user');
  };

  redirectToSearchResultTopic = () => {
    this.props.router.push('/search/result-topic');
  };

  onUserClick = ({ userId } = {}) => {
    this.props.router.push(`/user/${userId}`);
  };

  // 跳转话题详情
  onTopicClick = data => {
    const { topicId = '' } = data
    this.props.router.push(`/topic/topic-detail/${topicId}`)
  };

  onCancel = () => {
    this.props.router.back();
  };

  // 点击底部tabBar
  onClickTabBar = (data, index) => {
    if (index !== 1) {
      return
    }
    this.props.baselayout.setJumpingToTop();

    const { dispatch = () => {} } = this.props;
    dispatch('refresh', {});
  }

  componentDidMount() {
    const { search } = this.props;
    this.props.baselayout['h5SearchResult'] = -1;
    search.resetSearchData();
  }

  render() {
    const { indexTopics, indexUsers, indexThreads, indexTopicsError, indexUsersError, indexThreadsError, indexThreadsLoading } = this.props.search;
    const { pageData: topicsPageData } = indexTopics || {};
    const { pageData: usersPageData } = indexUsers || {};
    const { pageData: threadsPageData } = indexThreads || {};

    return (
      <BaseLayout
        allowRefresh={false}
        curr='search'
        showTabBar
        onClickTabBar={this.onClickTabBar}
        pageName="search"
      >
        <SearchInput onSearch={this.onSearch} onCancel={this.onCancel} isShowBottom={false}/>
        <SidebarPanel
          icon={{ type: 1, name: 'StrongSharpOutlined' }} 
          title="潮流话题" 
          onShowMore={this.redirectToSearchResultTopic}
          isLoading={!topicsPageData}
          noData={!topicsPageData?.length}
          platform='h5'
          isError={indexTopicsError.isError}
          errorText={indexTopicsError.errorText}
        >
          {
            topicsPageData?.length && <TrendingTopics data={topicsPageData} onItemClick={this.onTopicClick} />
          }
        </SidebarPanel>

        <SidebarPanel
          icon={{ type: 2, name: 'MemberOutlined' }}
          title="活跃用户" 
          onShowMore={this.redirectToSearchResultUser}
          isLoading={!usersPageData}
          noData={!usersPageData?.length}
          platform='h5'
          isError={indexUsersError.isError}
          errorText={indexUsersError.errorText}
        >
          {
            usersPageData?.length && <ActiveUsers data={usersPageData} onItemClick={this.onUserClick} />
          }
        </SidebarPanel>
		
		<SidebarPanel
		icon={{ type: 3, name: 'HotOutlined' }}
		title="热门内容" 
		onShowMore={this.redirectToSearchResultPost}
		isLoading={indexThreadsLoading}
		noData={!threadsPageData?.length}
		platform='h5'
		isError={indexThreadsError.isError}
		errorText={indexThreadsError.errorText}
		mold='plane'
		>
		<div style={{ marginRight: '10px', marginLeft: '10px',height:'10px' }}></div>
		{
		  threadsPageData?.filter((_, index) => index < 10).map((item, index) => <ThreadContent data={item} key={index} />)
		}
		</SidebarPanel>
		
      </BaseLayout>
    );
  }
}

export default withRouter(SearchH5Page);
