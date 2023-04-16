import React from 'react';
import { inject, observer } from 'mobx-react';
import SearchInput from '@components/search-input';
import TrendingTopics from './components/trending-topics';
import ActiveUsers from './components/active-users';
import ThreadContent from '@components/thread';
import BaseLayout from '@components/base-layout';
import SidebarPanel from '@components/sidebar-panel';
import Taro from '@tarojs/taro';

@inject('site')
@inject('search')
@observer
class SearchH5Page extends React.Component {
  onSearch = (keyword) => {
    Taro.navigateTo({url: `/subPages/search/result/index?keyword=${keyword || ''}`});
  };

  redirectToSearchResultPost = () => {
    Taro.navigateTo({url: '/subPages/search/result-post/index'});
  };

  redirectToSearchResultUser = () => {
    Taro.navigateTo({url: '/subPages/search/result-user/index'});
  };

  redirectToSearchResultTopic = () => {
    Taro.navigateTo({url: '/subPages/search/result-topic/index'});
  };

  onUserClick = ({ userId } = {}) => {
    Taro.navigateTo({url: `/userPages/user/index?id=${userId}`});
  };

  // 跳转话题详情
  onTopicClick = data => {
    const { topicId = '' } = data
    Taro.navigateTo({url: `/subPages/topic/topic-detail/index?id=${topicId}`})
  };

  onPostClick = data => console.log('post click', data);

  onCancel = () => {
    Taro.navigateBack({ delta: 1 })
  };

  render() {
    const { indexTopics, indexUsers, indexThreads, indexTopicsError, indexUsersError, indexThreadsError, indexThreadsLoading } = this.props.search;
    const { pageData: topicsPageData } = indexTopics || {};
    const { pageData: usersPageData } = indexUsers || {};
    const { pageData: threadsPageData } = indexThreads || {};
    return (
      <BaseLayout showHeader={false} allowRefresh={false} curr='search' showTabBar>
        <SearchInput onSearch={this.onSearch} onCancel={this.onCancel} isShowBottom={false} afterEnterClear/>
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
          {
            threadsPageData?.filter((_, index) => index < 10).map((item, index) => <ThreadContent data={item} key={index} />)
          }
        </SidebarPanel>
      </BaseLayout>
    );
  }
}

export default SearchH5Page;
