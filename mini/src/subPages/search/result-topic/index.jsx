import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '@layout/search/result-topic';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Page from '@components/page';
import { getCurrentInstance } from '@tarojs/taro';

@inject('site')
@inject('search')
@observer
class Index extends React.Component {
  page = 1;
  perPage = 10;

  async componentDidMount() {
    const { search } = this.props;
    const { keyword = '' } = getCurrentInstance().router.params;

    // if (!hasTopics) {
    //   this.toastInstance = Toast.loading({
    //     content: '加载中...',
    //     duration: 0,
    //   });

      this.page = 1;
      await search.getTopicsList({ search: keyword });

    //   this.toastInstance?.destroy();
    // }
  }

  dispatch = async (type, data) => {
    const { search } = this.props;

    if (type === 'refresh') {
      this.page = 1;
      search.setTopics(null);
    } else if (type === 'moreData') {
      this.page += 1;
    }
    await search.getTopicsList({ search: data, perPage: this.perPage, page: this.page });
    return;
  }

  render() {

    return (
      <Page>
        <IndexH5Page dispatch={this.dispatch} />
      </Page>
    );
  }
}

// eslint-disable-next-line new-cap
export default Index;
