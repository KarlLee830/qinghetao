import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '@layout/search/result-user';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Page from '@components/page';
import { getCurrentInstance } from '@tarojs/taro';

@inject('site')
@inject('search')
@observer
class Index extends React.Component {

  page = 1;
  perPage = 20;

  async componentDidMount() {
    const { search } = this.props;
    // const { keyword = '' } = router.query;
    const { keyword = '' } = getCurrentInstance().router.params;

    // this.toastInstance = Toast.loading({
    //   content: '加载中...',
    //   duration: 0,
    // });

    this.page = 1;
    await search.getUsersList({ search: keyword, perPage: this.perPage });

    // this.toastInstance?.destroy();
  }

  dispatch = async (type, data) => {
    const { search } = this.props;

    if (type === 'refresh') {
      this.page = 1;
      search.setUsers(null);
    } else if (type === 'moreData') {
      this.page += 1;
    }

    await search.getUsersList({ search: data, perPage: this.perPage, page: this.page });
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
