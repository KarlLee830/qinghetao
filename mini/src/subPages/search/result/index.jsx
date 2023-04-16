import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '@layout/search/result';
import { readUsersList, readTopicsList, readThreadList } from '@server';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Page from '@components/page';
import { getCurrentInstance } from '@tarojs/taro';

@inject('site')
@inject('search')
@inject('threadList')
@observer
class Index extends React.Component {

  constructor(props) {
    super(props);

    const { threadList } = this.props;
    threadList.registerList({ namespace: 'search/result' });
  }

  async componentDidMount() {
    const { search, router } = this.props;

    search.resetSearchData();

    const { keyword = '' } = getCurrentInstance().router.params;

    // 当服务器无法获取数据时，触发浏览器渲染
    const hasSearchTopics = !!search.searchTopics;
    const hasSearchUsers = !!search.searchUsers;
    const hasSearchThreads = !!search.searchThreads?.pageData?.length;

    await search.getSearchData({
      hasTopics: hasSearchTopics,
      hasUsers: hasSearchUsers,
      hasThreads: hasSearchThreads,
      search: keyword,
      type: 1,
    });
  }

  dispatch = async (type, data = '') => {
    const { search } = this.props;

    search.resetSearchData();

    search.getSearchData({ search: data, type: 1 });
  }

  render() {
    return (
      <Page>
        <IndexH5Page dispatch={this.dispatch} />
      </Page>
    )
  }
}

// eslint-disable-next-line new-cap
export default Index;
