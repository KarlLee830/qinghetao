import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexPage from '@layout/topic';
import { readTopicsList } from '@server';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import { getCurrentInstance } from '@tarojs/taro';
import Page from '@components/page';

@inject('site')
@inject('topic')
@observer
class Index extends React.Component {
  page = 1;
  perPage = 10;

  async componentDidMount() {
    const { topic } = this.props;
    const { keyword = '' } = getCurrentInstance().router.params;
    // 当服务器无法获取数据时，触发浏览器渲染
    // const hasTopics = !!topic.topics;

    // if (!hasTopics) {
    //   this.toastInstance = Toast.loading({
    //     content: '加载中...',
    //     duration: 0,
    //   });

      this.page = 1;
      await topic.getTopicsList({ search: keyword });

      // this.toastInstance?.destroy();
    // }
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
    return <Page><IndexPage dispatch={this.dispatch} /></Page>;
  }
}

// eslint-disable-next-line new-cap
export default Index;
