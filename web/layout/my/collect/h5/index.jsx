import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import ThreadContent from '@components/thread';
import { Toast } from '@discuzqsdk/design';
import styles from './index.module.scss';
import BaseLayout from '@components/base-layout';
import throttle from '@common/utils/thottle.js';

@inject('site')
@inject('threadList')
@inject('thread')
@observer
class Index extends React.Component {
  handleUnFavoriteItem = throttle(async (item) => {
    const { threadList } = this.props;

    const params = {
      id: item.threadId,
      isFavorite: false,
    };
    const favoriteResp = await this.props.thread.updateFavorite(params);
    if (favoriteResp.success === false) {
      Toast.error({
        content: favoriteResp.msg || '取消收藏失败',
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
        pageName={'collect'}
        quickScroll={true}
        showLoadingInCenter={!collectThreadsList?.length}
        showHeader={true}
        noMore={currentPage >= totalPage}
        onRefresh={this.props.dispatch}
        requestError={requestError.isError}
        errorText={requestError.errorText}
      >
        {collectThreadsList?.length !== 0 && (
          <div className={styles.titleBox}>
            <span className={styles.num}>{`${totalCount || 0}`}</span>
            条收藏
          </div>
        )}

        {collectThreadsList?.map((item, index) => (
          <ThreadContent
            onClickIcon={async () => {
              this.handleUnFavoriteItem(item);
            }}
            isShowIcon
            key={index}
            data={item}
          />
        ))}
      </BaseLayout>
    );
  }
}

export default withRouter(Index);
