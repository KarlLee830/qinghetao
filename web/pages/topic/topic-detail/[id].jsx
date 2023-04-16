import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '@layout/topic/topic-detail/h5';
import IndexPCPage from '@layout/topic/topic-detail/pc';
import { readTopicsList } from '@server';
import { Toast } from '@discuzqsdk/design';
import ViewAdapter from '@components/view-adapter';

import HOCFetchSiteData from '@middleware/HOCFetchSiteData';

@inject('site')
@inject('topic')
@inject('baselayout')
@inject('threadList')
@observer
class Index extends React.Component {
  page = 1;
  perPage = 10;

  static async getInitialProps(ctx) {
    const id = ctx?.query?.id;
    const topicFilter = {
      topicId: Number(id),
      hot: '0',
    };
    const result = await readTopicsList({ params: { filter: topicFilter, perPage: 10, page: 1 } });

    return {
      serverTopic: {
        topicDetail: result?.data,
      },
    };
  }

  constructor(props) {
    super(props);
    const { serverTopic, topic, threadList } = this.props;
    // 初始化数据到store中

    threadList.registerList({ namespace: topic.namespace });

    serverTopic && serverTopic.topicDetail && topic.setTopicDetail(serverTopic.topicDetail);
  }

  async componentDidMount() {
    const { topic, router } = this.props;
    const { id = '' } = router.query;
    const topicId = topic?.topicDetail?.pageData[0]?.topicId || '';
    // 当服务器无法获取数据时，触发浏览器渲染
    const hasTopics = !!topic.topicDetail?.pageData?.length;
    if (!hasTopics || Number(id) !== topicId) {
      this.props.baselayout['topicDetail'] = -1;
      try {
        await topic.getTopicsDetail({ perPage: this.perPage, page: this.page, topicId: id });
      } catch (errMsg) {
        consoe.log(errMsg);
      }
    }
  }

  
  dispatch = async () => {
    const { topic, router } = this.props;
    const { id = '' } = router.query;
    this.page += 1;
    await topic.getTopicsDetail({perPage: this.perPage, page: this.page, topicId: id});
    return;
  }

  render() {
    return <ViewAdapter
            h5={<IndexH5Page dispatch={this.dispatch}/>}
            pc={<IndexPCPage dispatch={this.dispatch}/>}
            title='话题详情'
          />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(Index);
