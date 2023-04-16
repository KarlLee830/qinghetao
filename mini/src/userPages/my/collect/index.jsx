import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '../../../layout/my/collect';
import Page from '@components/page';
import withShare from '@common/utils/withShare/withShare';
import { priceShare } from '@common/utils/priceShare';
import Taro from '@tarojs/taro';
import { updateThreadAssignInfoInLists } from '@common/store/thread-list/list-business';

@inject('site')
@inject('search')
@inject('topic')
@inject('index')
@inject('threadList')
@inject('user')
@observer
@withShare({})
class Index extends React.Component {
  page = 1;
  perPage = 10;

  constructor(props) {
    super(props);
    this.props.threadList.registerList({ namespace: 'collect' });
  }

  async componentDidMount() {
    Taro.hideShareMenu();
    const { threadList } = this.props;
    const threadsResp = await threadList.fetchList({
      namespace: 'collect',
      perPage: 10,
      page: this.page,
      filter: {
        complex: 3,
      },
    });

    threadList.setList({
      namespace: 'collect',
      data: threadsResp,
      page: this.page,
    });
  }

  componentWillUnmount() {
    const { threadList } = this.props;
    threadList.clearList({ namespace: 'collect' });
  }

  dispatch = async () => {
    const { threadList } = this.props;

    this.page += 1;

    const threadsResp = await threadList.fetchList({
      namespace: 'collect',
      perPage: 10,
      page: this.page,
      filter: {
        complex: 3,
      },
    });

    threadList.setList({
      namespace: 'collect',
      data: threadsResp,
      page: this.page,
    });
  };

  getShareData(data) {
    const { site } = this.props;
    const defalutTitle = site.webConfig?.setSite?.siteName || '';
    const defalutPath = '/userPages/my/collect/index';
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
      priceShare({ path, isAnonymous, isPrice }) || {
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
