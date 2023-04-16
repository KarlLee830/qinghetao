import React from 'react';
import { inject, observer } from 'mobx-react';
import ThreadContent from '@components/thread';
import styles from './index.module.scss';
import BaseLayout from '@components/base-layout';
import { View, Text } from '@tarojs/components';
import Toast from '@discuzqsdk/design/dist/components/toast';
import throttle from '@common/utils/thottle.js';

@inject('site')
@inject('threadList')
@inject('thread')
@observer
class Index extends React.Component {
  handleUnFavoriteItem = throttle(async (item) => {
    const { threadList } = this.props;
    // const { pageData = [], totalCount = 0 } = index.threads || {};
    const params = {
      id: item.threadId,
      isFavorite: false,
    };
    const favoriteResp = await this.props.thread.updateFavorite(params);
    if (favoriteResp.success === false) {
      Toast.error({
        content: favoriteResp.msg,
        duration: 2000,
      });
    } else {
      let collectTotalCount = threadList.getAttribute({
        namespace: 'collect',
        key: 'totalCount',
      });
      Toast.success({
        content: '取消收藏成功',
        duration: 2000,
      });
      // 这里需要对收藏条数做单独处理
      collectTotalCount = collectTotalCount - 1;
      if (collectTotalCount <= 0) {
        collectTotalCount = 0;
      }

      threadList.setAttribute({ namespace: 'collect', key: 'totalCount', value: collectTotalCount });
      threadList.deleteListItem({ namespace: 'collect', item });
    }
  }, 1000);

  render() {
    const { threadList } = this.props;

    const { lists } = threadList;

    const collectThreadsList = threadList.getList({
      namespace: 'collect',
    });

    const totalCount = threadList.getAttribute({
      namespace: 'collect',
      key: 'totalCount',
    });

    const totalPage = threadList.getAttribute({
      namespace: 'collect',
      key: 'totalPage',
    });

    const currentPage = threadList.getAttribute({
      namespace: 'collect',
      key: 'currentPage',
    });

    const requestError = threadList.getListRequestError({ namespace: 'collect' });

    return (
      <BaseLayout
        showLoadingInCenter={!collectThreadsList?.length}
        showHeader={false}
        noMore={currentPage >= totalPage}
        onRefresh={this.props.dispatch}
        requestError={requestError.isError}
        errorText={requestError.errorText}
      >
        {collectThreadsList?.length !== 0 && (
          <View className={styles.titleBox}>
            <Text className={styles.num}>{`${totalCount || 0}`}</Text>
            条收藏
          </View>
        )}

        {collectThreadsList?.map((item) => (
          <ThreadContent
            onClickIcon={async () => {
              this.handleUnFavoriteItem(item);
            }}
            isShowIcon
            key={`${item.threadId}-${item.updatedAt}`}
            data={item}
          />
        ))}
      </BaseLayout>
    );
  }
}

export default Index;
