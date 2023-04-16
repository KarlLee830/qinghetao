import React from 'react';
import { inject, observer } from 'mobx-react';
import BaseLayout from '@components/base-layout';
import TrendingTopicMore from '../../../search/pc/components/trending-topic-more';
import ActiveUsers from '@components/active-users';
import { withRouter } from 'next/router';
import Copyright from '@components/copyright';
import SidebarPanel from '@components/sidebar-panel';
import TopicItem from '@components/topic-item';
import styles from './index.module.scss';


@inject('site')
@inject('search')
@observer
class SearchResultTopicPCPage extends React.Component {
  constructor(props) {
    super(props);

    const keyword = this.props.router.query.keyword || this.props.search.currentKeyword || '';

    this.state = {
      keyword,
      refreshing: false,
    };
  }

  redirectToSearchResultUser = () => {
    this.props.router.push('/search/result-user');
  };

  onTopicClick = (data) => {
    const { topicId } = data;
    this.props.router.push(`/topic/topic-detail/${topicId}`);
  };

  fetchMoreData = () => {
    const { dispatch } = this.props;
    const { keyword } = this.state;
    return dispatch('moreData', keyword);
  };

  searchData = (keyword) => {
    const { dispatch } = this.props;
    dispatch('refresh', keyword);
  };

  onSearch = (value) => {
    // this.props.search.currentKeyword = keyword;
    this.props.router.replace(`/search/result-topic?keyword=${value}`);
    this.setState({ keyword: value }, () => {
      this.searchData(value);
    });
  }

  async componentDidMount() {
    const { search, router } = this.props;
    const { keyword = '' } = router.query;
    // 当服务器无法获取数据时，触发浏览器渲染
    const hasTopics = !!search.topics;

    if (!hasTopics || (keyword && search.currentKeyword && keyword !== search.currentKeyword)) {
      this.page = 1;
      await search.getTopicsList({ search: keyword, perPage: this.perPage });
    }
  }

  renderRight = () => (
      <>
        <ActiveUsers />
        <Copyright/>
      </>
    )

  render() {
    const { pageData, currentPage, totalPage } = this.props.search.topics || {};

    const { topicsError } = this.props.search || {};

    return (
      <BaseLayout
        noMore={currentPage >= totalPage}
        onRefresh={this.fetchMoreData}
        showRefresh={false}
        isShowLayoutRefresh={!!pageData?.length}
        onSearch={this.onSearch}
        right={this.renderRight}
        className="search-result-topic"
        pageName="resultTopic"
      >
        <SidebarPanel
          title="潮流话题"
          type='normal'
          isShowMore={false}
          noData={!pageData?.length}
          isLoading={!pageData}
          icon={{ type: 1, name: 'StrongSharpOutlined' }}
          isError={topicsError.isError}
          errorText={topicsError.errorText}
        >
          <div className={styles.topic}>
            {pageData?.map((item, index) => (
              <TopicItem data={item} key={index} onClick={this.onTopicClick} />
            ))}
          </div>

        </SidebarPanel>
      </BaseLayout>
    );
  }
}

export default withRouter(SearchResultTopicPCPage);
