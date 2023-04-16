import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '@layout/search/result-post';
import Page from '@components/page';
import { getCurrentInstance } from '@tarojs/taro';
import withShare from '@common/utils/withShare/withShare'
import { priceShare } from '@common/utils/priceShare';
import { updateThreadAssignInfoInLists } from '@common/store/thread-list/list-business';

@inject('search')
@inject('threadList')
@inject('index')
@inject('user')
@observer
@withShare({
  needShareline: false
})
class Index extends React.Component {

  page = 1;
  perPage = 10;

  constructor(props) {
    super(props);

    this.props.threadList.registerList({ namespace: 'search/result-post' });
  }

  async componentDidMount() {
    const { search, router } = this.props;
    const { keyword = '' } = getCurrentInstance().router.params;
    this.page = 1;
    await search.getThreadList({ search: keyword, scope: '2' });
  }
  getShareData (data) {
    const shareData = data.target?.dataset?.shareData
    if(data.from === 'menu') {
      return {
      }
    }
    const { title, path, comeFrom, threadId, isAnonymous, isPrice } = data
    if(comeFrom && comeFrom === 'thread') {
      const { user } = this.props
      this.props.index.updateThreadShare({ threadId }).then(result => {
      if (result.code === 0) {
        updateThreadAssignInfoInLists(threadId, { updateType: 'share', updatedInfo: result.data, user: user.userInfo });
      }
    });
    }
    return priceShare({isPrice, isAnonymous, path}) || {
      title,
      path
    }
  }

  dispatch = async (type, keyword) => {
    const { search } = this.props;
  
    if (type === 'refresh') {
      this.page = 1;
      search.setThreads(null);
    } else if (type === 'moreData') {
      this.page += 1;
    }

    await search.getThreadList({ search: keyword, perPage: this.perPage, page: this.page, scope: '2' });

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
