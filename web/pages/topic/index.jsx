import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '@layout/topic/h5';
import IndexPCPage from '@layout/topic/pc';
import { readTopicsList } from '@server';
import { Toast } from '@discuzqsdk/design';

import HOCFetchSiteData from '@middleware/HOCFetchSiteData';

@inject('site')
@inject('topic')
@observer
class Index extends React.Component {
  static async getInitialProps(ctx) {
    const search = ctx?.query?.keyword || '';
    const topicFilter = {
      content: search,
    };
    const result = await readTopicsList({ params: { filter: topicFilter } });

    return {
      serverTopic: {
        topics: result?.data,
      },
    };
  }

  page = 1;
  perPage = 10;

  constructor(props) {
    super(props);
    const { serverTopic, topic } = this.props;
    // 初始化数据到store中
    serverTopic && serverTopic.topics && topic.setTopics(serverTopic.topics);
  }

  async componentDidMount() {
    const { topic, router } = this.props;
    const { keyword = '' } = router.query;
    // 当服务器无法获取数据时，触发浏览器渲染
    const hasTopics = !!topic.topics;

    if (!hasTopics) {
      this.toastInstance = Toast.loading({
        content: '加载中...',
        duration: 0,
      });

      this.page = 1;
      await topic.getTopicsList({ search: keyword });

      this.toastInstance?.destroy();
    }
  }

  dispatch = async (type, data) => {
    const { topic } = this.props;
    const { keyword, sort } = data

    if (type === 'refresh') {
      this.page = 1;
    } else if (type === 'moreData') {
      this.page += 1;
    }

    await topic.getTopicsList({ search: keyword, sortBy: sort, perPage: this.perPage, page: this.page });
    return;
  }

  render() {
    const { site } = this.props;
    const { platform } = site;

    if (platform === 'pc') {
      return <IndexPCPage dispatch={this.dispatch} />;
    }

    return <IndexH5Page dispatch={this.dispatch} />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(Index);