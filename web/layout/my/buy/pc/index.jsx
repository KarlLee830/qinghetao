import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import styles from './index.module.scss';
import BaseLayout from '@components/base-layout';
import ThreadContent from '@components/thread';
import Copyright from '@components/copyright';
import PopTopic from '@components/pop-topic';
import UserCenterFansPc from '@components/user-center/fans-pc';
import SidebarPanel from '@components/sidebar-panel';

@inject('site')
@inject('threadList')
@observer
class BuyPCPage extends React.Component {
  constructor(props) {
    super(props);
  }

  redirectToSearchResultPost = () => {
    this.props.router.push(`/search/result-post?keyword=${this.state.value || ''}`);
  };

  // 右侧 - 潮流话题 粉丝 版权信息
  renderRight = () => (
    <div className={styles.right}>
      <PopTopic />
      <Copyright />
    </div>
  );

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
        right={this.renderRight}
        noMore={currentPage >= totalPage}
        onRefresh={this.props.dispatch}
        showRefresh={false}
        pageName={'buy'}
        rightClass={styles.rightSide}
        isShowLayoutRefresh={!!buyThreadsList?.length}
        className="mybuy"
      >
        <SidebarPanel
          title="我的购买"
          type='normal'
          isShowMore={false}
          noData={!buyThreadsList?.length}
          isLoading={!(totalCount>=0)}
          icon={{ type: 3, name: 'ShoppingCartOutlined' }}
          rightText={totalCount !== undefined ? `共有${totalCount}条购买` : null}
          mold='plane'
          isError={requestError.isError}
          errorText={requestError.errorText}
        >
          {buyThreadsList?.map((item, index) => (
            <ThreadContent className={index === 0 && styles.threadStyle} data={item} key={index} />
          ))}
        </SidebarPanel>
      </BaseLayout>
    );
  }
}

export default withRouter(BuyPCPage);
