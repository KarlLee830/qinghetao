import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import ThreadContent from '@components/thread';
import BaseLayout from '@components/base-layout';
import styles from './index.module.scss';

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
        quickScroll={true}
        pageName={'buy'}
        showHeader={true}
        noMore={currentPage >= totalPage}
        onRefresh={this.props.dispatch}
      >
        {buyThreadsList?.length !== 0 && (
          <div className={styles.titleBox}>
            <span className={styles.num}>{`${totalCount || 0}`}</span>
            条购买
          </div>
        )}
        {buyThreadsList?.map((item, index) => (
          <ThreadContent key={index} data={item} />
        ))}
      </BaseLayout>
    );
  }
}

export default withRouter(Index);
