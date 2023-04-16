import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '@layout/search/result-post/h5';
import IndexPCPage from '@layout/search/result-post/pc';
import { readThreadList } from '@server';
import { Toast } from '@discuzqsdk/design';
import ViewAdapter from '@components/view-adapter';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';

@inject('site')
@inject('search')
@inject('threadList')
@observer
class Index extends React.Component {
  static async getInitialProps(ctx) {
    const search = ctx?.query?.keyword || '';
    const result = await readThreadList({ params: { scope: '2', filter: { sort: '3', search } } }, ctx);
    return {
      serverSearch: {
        threads: result?.data,
      },
    };
  }

  page = 1;
  perPage = 10;

  constructor(props) {
    super(props);
    const { serverSearch, search, threadList } = this.props;

    threadList.registerList({ namespace: 'search/result-post' });

    // 初始化数据到store中
    serverSearch && serverSearch.threads && search.setThreads(serverSearch.threads);
  }

  dispatch = async (type, keyword) => {
    const { search } = this.props;

    if (type === 'refresh') {
      this.page = 1;
      search.setThreads(null);
    } else if (type === 'moreData') {
      this.page += 1;
    }

    await search.getThreadList({ search: keyword, perPage: this.perPage, page: this.page, scope: '2', sort: '3' });

    return;
  }

  render() {
    return (
      <ViewAdapter
        h5={<IndexH5Page dispatch={this.dispatch} />}
        pc={ <IndexPCPage dispatch={this.dispatch} />}
        title='热门内容'
      />
    );
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(Index);
