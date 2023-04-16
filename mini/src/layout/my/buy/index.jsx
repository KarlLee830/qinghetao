import React from 'react';
import { inject, observer } from 'mobx-react';
import ThreadContent from '@components/thread';
import styles from './index.module.scss';
import BaseLayout from '@components/base-layout';
import { View, Text } from '@tarojs/components';

@inject('site')
@inject('threadList')
@observer
class Index extends React.Component {
  render() {
    const { threadList } = this.props;

    const { lists } = threadList;

    const buyThreadsList = threadList.getList({
      namespace: 'buy',
    });

    const totalCount = threadList.getAttribute({
      namespace: 'buy',
      key: 'totalCount',
    });

    const totalPage = threadList.getAttribute({
      namespace: 'buy',
      key: 'totalPage',
    });

    const currentPage = threadList.getAttribute({
      namespace: 'buy',
      key: 'currentPage',
    });

    const requestError = threadList.getListRequestError({ namespace: 'buy' });

    return (
      <BaseLayout
        requestError={requestError.isError}
        errorText={requestError.errorText}
        showHeader={false}
        noMore={currentPage >= totalPage}
        onRefresh={this.props.dispatch}
        showLoadingInCenter={!buyThreadsList?.length}
      >
        {buyThreadsList?.length !== 0 && (
          <View className={styles.titleBox}>
            <Text className={styles.num}>{`${totalCount || 0}`}</Text>
            条购买
          </View>
        )}

        {buyThreadsList?.map((item, index) => (
          <ThreadContent key={index} data={item} />
        ))}
      </BaseLayout>
    );
  }
}

export default Index;
