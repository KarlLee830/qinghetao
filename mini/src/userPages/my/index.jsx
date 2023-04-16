import React, { useEffect } from 'react';
import MyContent from '../../layout/my/index';
import Page from '@components/page';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { inject, observer } from 'mobx-react';
import withShare from '@common/utils/withShare/withShare';
import { priceShare } from '@common/utils/priceShare';
import { updateThreadAssignInfoInLists } from '@common/store/thread-list/list-business';

@inject('site')
@inject('search')
@inject('topic')
@inject('index')
@inject('user')
@observer
@withShare({})
class Index extends React.Component {
  componentDidMount() {
    Taro.hideHomeButton();
  }

  getShareData(data) {
    const { site } = this.props;
    const id = this.props.user?.id;
    const defalutTitle = `${this.props.user.nickname || this.props.user.username}的主页`;
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
      <Page withLogin>
        <MyContent />
      </Page>
    );
  }
}

export default Index;
