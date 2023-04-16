import React from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import BaseLayout from '@components/base-layout';
import NoData from '@components/no-data';
import DetailsHeader from './components/details-header'
import ThreadContent from '@components/thread';
import h5Share from '@discuzqsdk/sdk/dist/common_modules/share/h5';
import goToLoginPage from '@common/utils/go-to-login-page';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import { View, Text } from '@tarojs/components';
import BottomView from '@components/list/BottomView'

@inject('site')
@inject('user')
@inject('topic')
@observer
class TopicH5Page extends React.Component {
  renderItem = ({ content = '', threadCount = 0, viewCount = 0 }) => {
    const threads = this.props.topic?.topicThreads?.pageData || [];
    return <View>
        <DetailsHeader title={content} viewNum={viewCount} contentNum={threadCount} onShare={this.onShare} />
        <View className={styles.themeContent}>
          {
            threads?.length ?
              (
                threads?.map((item, itemIndex) => (
                  <ThreadContent data={item} key={itemIndex} />
                ))
              )
              : ''
          }
          </View>
        </View>
  }


  fetchMoreData = () => {
    const { dispatch } = this.props;
    return dispatch();
  };

  render() {
    const { pageData = [], currentPage, totalPage } = this.props.topic?.topicDetail || {};
    return (
      <BaseLayout
        showHeader={false}
        allowRefresh={false}
        noMore={currentPage >= totalPage}
        onRefresh={this.fetchMoreData}
      >
        { this.renderItem(pageData[0] || {}) }
      </BaseLayout>
    );
  }
}
export default TopicH5Page;
