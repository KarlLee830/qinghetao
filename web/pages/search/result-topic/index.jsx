import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '@layout/search/result-topic/h5';
import IndexPCPage from '@layout/search/result-topic/pc';
import { readTopicsList, readUsersList } from '@server';
import { Toast } from '@discuzqsdk/design';
import ViewAdapter from '@components/view-adapter';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';

@inject('site')
@inject('search')
@observer
class Index extends React.Component {
  static async getInitialProps(ctx) {
    const search = ctx?.query?.keyword || '';
    const topicFilter = {
      hot: 0,
      content: search,
    };
    const result = await readTopicsList({ params: { filter: topicFilter } });
    return {
      serverSearch: {
        topics: result?.data,
      },
    };
  }

  page = 1;
  perPage = 20;

  constructor(props) {
    super(props);
    const { serverSearch, search } = this.props;
    // 初始化数据到store中
    serverSearch && serverSearch.topics && search.setTopics(serverSearch.topics);
  }

  dispatch = async (type, data) => {
    const { search } = this.props;
    if (type === 'refresh') {
      this.page = 1;
      search.setTopics(null);
    } else if (type === 'moreData') {
      this.page += 1;
    }
    await search.getTopicsList({ search: data,  perPage: this.perPage, page: this.page });
    return;
  }

  render() {
    return (
      <ViewAdapter
        h5={<IndexH5Page dispatch={this.dispatch} />}
        pc={<IndexPCPage dispatch={this.dispatch} />}
        title='潮流话题'
      />
    );
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(Index);
