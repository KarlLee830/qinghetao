import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import styles from './index.module.scss';
import BaseLayout from '@components/base-layout';
import ThreadContent from '@components/thread';
import Copyright from '@components/copyright';
import SidebarPanel from '@components/sidebar-panel';
import PopTopic from '@components/pop-topic';
import UserCenterFansPc from '@components/user-center/fans-pc';

@inject('site')
@inject('threadList')
@inject('search')
@observer
class LikePCPage extends React.Component {
  constructor(props) {
    super(props);
  }

  redirectToSearchResultTopic = () => {
    this.props.router.push('/search/result-topic');
  };

  fetchMoreData = () => {
    const { dispatch } = this.props;
    return dispatch('moreData');
  };

  // 右侧 - 潮流话题 粉丝 版权信息
  renderRight = () => {
    const { pageData = [] } = this.props.search.topics || { pageData: [] };
    return (
      <>
        <PopTopic />
        <Copyright />
      </>
    );
  };

  render() {
    const { threadList } = this.props;

    const { lists } = threadList;

    const likeThreadList = threadList.getList({ namespace: 'like' });

    const totalCount = threadList.getAttribute({
      namespace: 'like',
      key: 'totalCount',
    });

    const totalPage = threadList.getAttribute({
      namespace: 'like',
      key: 'totalPage',
    });

    const currentPage = threadList.getAttribute({
      namespace: 'like',
      key: 'currentPage',
    });

    const requestError = threadList.getListRequestError({ namespace: 'like' });

    return (
      <BaseLayout
        right={this.renderRight}
        noMore={currentPage >= totalPage}
        showRefresh={false}
        onRefresh={this.fetchMoreData}
        rightClass={styles.rightSide}
        isShowLayoutRefresh={!!likeThreadList?.length}
        pageName={'like'}
        className="mylike"
      >
        <SidebarPanel
          title="我的点赞"
          type="normal"
          isShowMore={false}
          noData={!likeThreadList?.length}
          isLoading={!(totalCount>=0)}
          icon={{ type: 3, name: 'LikeOutlined' }}
          rightText={totalCount !== undefined ? `共有${totalCount}条点赞` : null}
          className={styles.container}
          mold="plane"
          isError={requestError.isError}
          errorText={requestError.errorText}
        >
          {likeThreadList?.map((item, index) => (
            <ThreadContent
              className={styles.threadContent}
              data={item}
              key={item.threadId}
              onPraise={({ isLiked }) => {
                if (!isLiked) {
                  setTimeout(() => {
                    threadList.deleteTargetListItem({
                      namespace: 'like',
                      item: {...item, isLiked}
                    })
                  }, 100)
                }
              }} />
          ))}
        </SidebarPanel>
      </BaseLayout>
    );
  }
}

export default withRouter(LikePCPage);
