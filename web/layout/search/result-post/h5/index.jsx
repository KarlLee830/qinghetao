import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import SearchInput from '@components/search-input';
import ThreadContent from '@components/thread';
import BaseLayout from '@components/base-layout';
import styles from './index.module.scss';

@inject('site')
@inject('search')
@inject('baselayout')
@observer
class SearchResultPostH5Page extends React.Component {
  constructor(props) {
    super(props);

    const keyword = this.props.router.query.keyword || this.props.search.currentPostKeyword || ''; // url中的关键词参数优先

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
    this.props.router.replace(`/search/result-post?keyword=${keyword}`);
    this.setState({ keyword }, () => {
      this.refreshData();
    });
  };

  async componentDidMount() {
    const { search, router, baselayout } = this.props;
    const { keyword = '' } = router.query;
    // 当服务器无法获取数据时，触发浏览器渲染
    const hasThreads = !!search.threads?.pageData?.length;

    if (!hasThreads || (keyword && keyword !== search.currentPostKeyword)) { // 缓存为空或者url参数与缓存不同，刷新；否则，有缓存的关键词，需要回到原来位置
      this.page = 1;
      search.resetResultData();
      baselayout.resultPost = -1;
      // 建中：发现页即 scope为2是发现页，发现的排序是 先按热度，热度相同再更新时间，所以当在发现有传scope为2是得到的结果是没有错
      await search.getThreadList({ search: keyword, perPage: this.perPage, scope: '2' });
    }
  }

  render() {
    const { keyword } = this.state;
    const { threads, threadsError } = this.props.search;
    const { pageData, currentPage, totalPage } = threads || { pageData: [] };

    return (
      <BaseLayout
          onRefresh={this.fetchMoreData}
          noMore={currentPage >= totalPage}
          requestError={threadsError.isError}
          errorText={threadsError.errorText}
          pageName="resultPost"
      >
        <div className={styles.topBox}>
          <SearchInput onSearch={this.onSearch} onCancel={this.onCancel} defaultValue={keyword} isShowBottom={false} searchWhileTyping/>
        </div>
        {
          pageData?.map((item, index, arr) => (
            <ThreadContent showBottomStyle={index !== arr.length - 1} key={`${item.threadId}-${item.updatedAt}`} data={item} />
          ))
        }
      </BaseLayout>
    );
  }
}

export default withRouter(SearchResultPostH5Page);
