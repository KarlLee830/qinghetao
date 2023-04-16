import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import styles from './index.module.scss';
import BaseLayout from '@components/base-layout';
import ThreadContent from '@components/thread';
import goToLoginPage from '@common/utils/go-to-login-page';
import Copyright from '@components/copyright';
import SidebarPanel from '@components/sidebar-panel';
import { Toast } from '@discuzqsdk/design';
import TopicItem from '@components/search/topic-item'
import ActiveUsersMore from '@components/search/active-user-more-items';
import Stepper from '@components/stepper';

@inject('site')
@inject('search')
@inject('user')
@observer
class SearchPCPage extends React.Component {
  constructor(props) {
    super(props);

    const keyword = this.props.router.query.keyword || '';
    this.state = {
      value: keyword,
      stepIndex: 0,
      position: -1,
    };
    this.treadingTopicRef = React.createRef();
    this.activeUsersRef = React.createRef();
    this.hotTopicRef = React.createRef();

    // 是否点击step
    this.isClick = false

    this.noDataViewH = 120
  }

  redirectToSearchResultPost = () => {
    const { site, searchNoData } = this.props;

    if (searchNoData && site.platform === 'pc') {
      this.props.router.push('/search/result-post');
    } else {
      this.props.router.push(`/search/result-post?keyword=${this.state.value || ''}`);
    }
  };

  redirectToSearchResultUser = () => {
    const { site, searchNoData } = this.props;

    if (searchNoData && site.platform === 'pc') {
      this.props.router.push('/search/result-user');
    } else {
      this.props.router.push(`/search/result-user?keyword=${this.state.value || ''}`);
    }
  };

  redirectToSearchResultTopic = () => {
    const { site, searchNoData } = this.props;

    if (searchNoData && site.platform === 'pc') {
      this.props.router.push('/search/result-topic');
    } else {
      this.props.router.push(`/search/result-topic?keyword=${this.state.value || ''}`);
    }
  };

  onUserClick = ({ userId } = {}) => {
    this.props.router.push(`/user/${userId}`);
  };

  onTopicClick = data => {
    const { topicId } = data
    this.props.router.push(`/topic/topic-detail/${topicId}`);
  };

  searchData = (keyword) => {
    const { dispatch } = this.props;
    dispatch('search', keyword);
  };

  onSearch = (value) => {
    this.props.router.replace(`/search?keyword=${value}`);
    this.setState({ value }, () => {
      this.searchData(value);
    });
  }

  onFollow = ({ id, type }) => {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }
    if (type === '1') {
      this.props.search.postFollow(id).then(result => {
        if (result) {
          const { isMutual = 0 } = result
          this.props.search.updateActiveUserInfo(id, { isFollow: true, isMutual: !!isMutual })
        }
      }).catch(err => {
        Toast.info({ content: err });
      })
    } else {
      this.props.search.cancelFollow({ id, type: 1 }).then(result => {
        if (result) {
          this.props.search.updateActiveUserInfo(id, { isFollow: false, isMutual: false })
        }
      })
    }
  }

  itemClick = (index) => {
    const { hasTopics = false, hasUsers = false, hasThreads = false, isShowAll = true } = this.props.search.dataIndexStatus || {}

    const disableClickTopic = !hasTopics && !isShowAll && index === 0
    const disableClickUser = !hasUsers && !isShowAll && index === 1
    const disableClickThread = !hasThreads && !isShowAll && index === 2
    if (disableClickTopic || disableClickUser || disableClickThread) {
      return
    }

    const HEADER_HEIGHT = 57;
    const STEPPER_PADDING = 24;
    let pos = -1, scrollTo = -1;

    switch (index) {
      case 0:
        pos = this.treadingTopicRef?.current?.offsetTop || 0;
        break;
      case 1:
        pos = this.activeUsersRef?.current?.offsetTop || 0;
        break;
      case 2:
        pos = this.hotTopicRef?.current?.offsetTop || 0;
        break;
      default:
        return;
    }
    scrollTo = pos + parseInt(HEADER_HEIGHT / 2) - STEPPER_PADDING;

    const stepIndex = this.props.stepIndex;
    if (stepIndex !== index) {
      this.setState({position: scrollTo});
      // this.setState({stepIndex: index});
      this.isClick = true
      this.props.dispatch('update-step-index', index)
    }
  }

  handleScroll = ({ scrollTop = 0 } = {}) => {
    if (isNaN(scrollTop) || this.isClick) {
      this.isClick = false
      return
    }

    const { topicHeight, userHeight, threadHeight, totalHeight } = this.getDivHeight()
    const { searchNoData = false } = this.props

    const otherHeight = searchNoData ? this.noDataViewH + 12 : 12

    let stepIndex = 0
    if (topicHeight !== 0 && scrollTop < topicHeight + otherHeight) {
      stepIndex = 0
    } else if (userHeight !== 0 && scrollTop < topicHeight + userHeight + otherHeight) {
      stepIndex = 1
    } else if (threadHeight !== 0 && scrollTop < totalHeight + otherHeight) {
      stepIndex = 2
    }

    this.props.dispatch('update-step-index', stepIndex)

    // 滑动之后，重置position
    this.setState({position: -1});
  }

  // 右侧 - 步骤条
  renderRight = () => {
    const { stepIndex } = this.props
  
    return (
      <div className={styles.searchRight}>
        <Stepper onItemClick={this.itemClick} selectIndex={stepIndex}/>
        <Copyright/>
      </div>
    )
  }

  // 中间 -- 热门内容
  renderContentHotThread = () => {
    const { indexThreads, indexThreadsError } = this.props.search;
    const { pageData: threadsPageData } = indexThreads || {};

    return (
        <div ref={this.hotTopicRef}>
          <SidebarPanel
            type='normal'
            isLoading={!threadsPageData}
            noData={!threadsPageData?.length}
            title="热门内容"
            icon={{ type: 3, name: 'HotOutlined' }}
            onShowMore={this.redirectToSearchResultPost}
            mold='plane'
            isError={indexThreadsError.isError}
            errorText={indexThreadsError.errorText}
          >
            {threadsPageData?.filter((_, index) => index < 10).map((item, index) => <ThreadContent className={styles.threadContent} data={item} key={index} />)}
          </SidebarPanel>
        </div>
    )
  }

  // 中间 -- 潮流话题
  renderContentPopTopic = () => {
    const { indexTopics, indexTopicsError } = this.props.search;
    const { pageData: topicsPageData } = indexTopics || {};

    return (
      <div ref={this.treadingTopicRef}>
          <SidebarPanel
            title="潮流话题"
            type='normal'
            isLoading={!topicsPageData}
            noData={!topicsPageData?.length}
            onShowMore={this.redirectToSearchResultTopic}
            icon={{ type: 1, name: 'StrongSharpOutlined' }}
            isError={indexTopicsError.isError}
            errorText={indexTopicsError.errorText}
          >
            <div className={styles.topic}>
              {topicsPageData?.map((item, index) => (
                <TopicItem data={item} key={index} onClick={this.onTopicClick} />
              ))}
            </div>
          </SidebarPanel>
      </div>
    )
  }

  // 中间 -- 活跃用户
  renderContentActiveUser = () => {
    const { indexUsers, indexUsersError } = this.props.search;
    const userId = this.props.user?.userInfo?.id
    const { pageData: usersPageData } = indexUsers || {};

    return (
      <div ref={this.activeUsersRef}>
        <SidebarPanel
          title="活跃用户"
          type='normal'
          isLoading={!usersPageData}
          noData={!usersPageData?.length}
          onShowMore={this.redirectToSearchResultUser}
          icon={{ type: 2, name: 'MemberOutlined' }}
          isError={indexUsersError.isError}
          errorText={indexUsersError.errorText}
        >
          <ActiveUsersMore data={usersPageData} onItemClick={this.onUserClick} onFollow={this.onFollow} userId={userId} />
        </SidebarPanel>
      </div>
    )
  }

  renderContent = () => {
    const { hasTopics, hasUsers, hasThreads, isShowAll } = this.props.search.dataIndexStatus
    const { searchNoData = false } = this.props

    return (
      <div className={styles.searchContent}>
        { searchNoData && <div className={styles.noDataView}>暂无相关内容</div> }
        { (isShowAll || hasTopics) && this.renderContentPopTopic() }
        { (isShowAll || hasUsers) && this.renderContentActiveUser() }
        { (isShowAll || hasThreads) && this.renderContentHotThread() }
      </div>
    )
  }

  // 获取各模块的高度
  getDivHeight = () => {
    const topicHeight = this.treadingTopicRef.current?.clientHeight || 0;
    const userHeight = this.activeUsersRef.current?.clientHeight || 0;
    const threadHeight = this.hotTopicRef.current?.clientHeight || 0;

    const totalHeight = topicHeight + userHeight + threadHeight

    return { topicHeight, userHeight, threadHeight, totalHeight }
  }

  render() {
    const { isNoData } = this.props.search.dataIndexStatus

    const { indexTopics, indexUsers, indexThreads, indexTopicsError, indexUsersError, indexThreadsError } = this.props.search;
    const { pageData: topicsPageData } = indexTopics || {};
    const { pageData: usersPageData } = indexUsers || {};
    const { pageData: threadsPageData } = indexThreads || {};

    const noMore = !!topicsPageData && !!usersPageData && !!threadsPageData

    return (
        <BaseLayout
          onSearch={this.onSearch}
          right={ this.renderRight }
          onScroll={ this.handleScroll }
          jumpTo={this.state.position}
          pageName="search"
          className="search-page"
          onRefresh={() => {}}
          isShowLayoutRefresh={isNoData && !noMore}
          loadingText='正在加载'
          showRefresh={false}
        >
          { this.renderContent() }
        </BaseLayout>
    );
  }
}

export default withRouter(SearchPCPage);
