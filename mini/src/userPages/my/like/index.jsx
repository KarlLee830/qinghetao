import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '../../../layout/my/like';
import Page from '@components/page';
import withShare from '@common/utils/withShare/withShare';
import { priceShare } from '@common/utils/priceShare';
import Taro from '@tarojs/taro';
import { updateThreadAssignInfoInLists } from '@common/store/thread-list/list-business';

@inject('site')
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
    this.props.threadList.registerList({ namespace: 'like' });
  }

  async componentDidMount() {
    Taro.hideShareMenu();
    this.dispatch();
  }

  componentWillUnmount() {
    this.props.threadList.clearList({ namespace: 'like' });
  }

  dispatch = async () => {
    const { threadList } = this.props;

    const threadsResp = await threadList.fetchList({
      namespace: 'like',
      perPage: this.perPage,
      page: this.page,
      filter: {
        complex: 2,
      },
    });

    threadList.setList({
      namespace: 'like',
      data: threadsResp,
      page: this.page,
    });

    this.page += 1;
  };

  getShareData(data) {
    const { site } = this.props;
    const defalutTitle = site.webConfig?.setSite?.siteName || '';
    const defalutPath = '/userPages/my/like/index';
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
      priceShare({ path, isPrice, isAnonymous }) || {
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
