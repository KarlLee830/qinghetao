import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import SearchInput from '@components/search-input';
import BaseLayout from '@components/base-layout';
import TopicItem from '@components/topic-item'
import styles from './index.module.scss';

@inject('search')
@inject('baselayout')
@observer
class SearchResultTopicH5Page extends React.Component {
  constructor(props) {
    super(props);

    const keyword = this.props.router.query.keyword || this.props.search.currentTopicKeyword || ''; // url中的关键词参数优先

    this.state = {
      keyword: keyword,
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
    // this.props.search.currentTopicKeyword = keyword;
    this.props.router.replace(`/search/result-topic?keyword=${keyword}`);
    this.setState({ keyword }, () => {
      this.refreshData();
    });
  };

  onTopicClick = data => {
    const { topicId = '' } = data
    this.props.router.push(`/topic/topic-detail/${topicId}`)
  };

  async componentDidMount() {
    const { search, router, baselayout } = this.props;
    const { keyword = '' } = router.query;
    // 当服务器无法获取数据时，触发浏览器渲染
    const hasTopics = !!search.topics;

    if (!hasTopics || (keyword && keyword !== search.currentTopicKeyword)) { // 缓存为空或者url参数与缓存不同，刷新；否则，有缓存的关键词，需要回到原来位置
      this.page = 1;
      search.resetResultData();
      baselayout.resultTopic = -1;
      await search.getTopicsList({ search: keyword, perPage: this.perPage });
    }
  }

  render() {
    const { keyword } = this.state;
    const { topics, topicsError } = this.props.search;
    const { pageData = [], currentPage, totalPage } = topics || { pageData: [] };

    return (
        <BaseLayout
          onRefresh={this.fetchMoreData}
          noMore={currentPage >= totalPage}
          requestError={topicsError.isError}
          errorText={topicsError.errorText}
          pageName="resultTopic"
        >
          <SearchInput onSearch={this.onSearch} onCancel={this.onCancel} defaultValue={keyword} searchWhileTyping/>
          <div className={styles.wrapper}>
            {
              pageData?.map((item, index) => (
                <TopicItem key={index} data={item} onClick={this.onTopicClick} />
              ))
            }
          </div>
        </BaseLayout>
    );
  }
}

export default withRouter(SearchResultTopicH5Page);
