import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '../../../layout/my/buy';
import Page from '@components/page';
import withShare from '@common/utils/withShare/withShare';
import { priceShare } from '@common/utils/priceShare';
import Taro from '@tarojs/taro';
import { updateThreadAssignInfoInLists } from '@common/store/thread-list/list-business';

@inject('site')
@inject('search')
@inject('topic')
@inject('threadList')
@inject('index')
@inject('user')
@observer
@withShare({})
class Index extends React.Component {
  page = 1;
  perPage = 10;
  loading = false;

  constructor(props) {
    super(props);
    this.props.threadList.registerList({ namespace: 'buy' });
  }

  async componentDidMount() {
    Taro.hideShareMenu();
    this.dispatch();
  }

  componentWillUnmount() {
    const { threadList } = this.props;
    threadList.clearList({ namespace: 'buy' });
  }

  dispatch = async () => {
    if (this.loading) return;
    this.loading = true;
    const { threadList } = this.props;
    const threadsResp = await threadList.fetchList({
      namespace: 'buy',
      perPage: 10,
      page: this.page,
      filter: {
        complex: 4,
      },
    });

    threadList.setList({
      namespace: 'buy',
      data: threadsResp,
      page: this.page,
    });

    if (this.page <= threadsResp.data.totalPage) {
      this.page += 1;
    }

    this.loading = false;
  };

  getShareData(data) {
    const { site } = this.props;
    const defalutTitle = site.webConfig?.setSite?.siteName || '';
    const defalutPath = '/userPages/my/buy/index';
    if (data.from === 'menu') {
      return {
        title: defalutTitle,
        path: defalutPath,
      };
    }
    const { title, path, comeFrom, threadId, isAnonymous, isPrice } = data;
    if (comeFrom && comeFrom === 'thread') {
      const { user } = this.props;
      this.props.index.updateThreadShare({ threadId }).then((result) => {
        if (result.code === 0) {
          updateThreadAssignInfoInLists(threadId, {
            updateType: 'share',
            updatedInfo: result.data,
            user: user.userInfo,
          });
        }
      });
    }
    return (
      priceShare({ isPrice, isAnonymous, path }) || {
        title,
        path,
      }
    );
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
