import React, { useEffect } from 'react';
import OtherView from '../../layout/my/other-user/index';
import Page from '@components/page';
import { View, Text } from '@tarojs/components';
import { inject, observer } from 'mobx-react';
import withShare from '@common/utils/withShare/withShare';
import { priceShare } from '@common/utils/priceShare';
import Taro, { getCurrentInstance, eventCenter } from '@tarojs/taro';
import { updateThreadAssignInfoInLists } from '@common/store/thread-list/list-business';

@inject('site')
@inject('search')
@inject('topic')
@inject('index')
@inject('user')
@observer
@withShare({})
class Index extends React.Component {
  getShareData(data) {
    const { site } = this.props;
    const { id = '' } = getCurrentInstance().router.params;
    const defalutTitle = `${this.props.user?.targetUsers?.[id]?.nickname || this.props.user?.targetUsers?.[id]?.username}的主页`;
    const defalutPath = `/userPages/user/index?id=${id}&share=true`;
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
      priceShare({ isAnonymous, isPrice, path }) || {
        title,
        path,
      }
    );
  }
  render() {
    return (
      <Page>
        <OtherView />
      </Page>
    );
  }
}

export default Index;
