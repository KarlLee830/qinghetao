import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import styles from './index.module.scss';
import BaseLayout from '@components/base-layout';
import SectionTitle from '@components/section-title';
import TopicItem from '@components/search/topic-item';
import List from '@components/list';
import Copyright from '@components/copyright';
@inject('site')
@inject('user')
@inject('topic')
@observer
class IndexPCPage extends React.Component {
  state = {
    keyword: '',
    sort: ''
  }
  redirectToSearchResultUser = () => {
    this.props.router.push('/search/result-user');
  };
  onTopicClick = data => {
    const { topicId } = data;
    if(topicId) this.props.router.push(`/topic/topic-detail/${topicId}`);
  };
  fetchMoreData = () => {
    const { dispatch } = this.props;
    const { keyword } = this.state;
    return dispatch('moreData', keyword);
  };
  onSearch = (keyword = '') => {
    this.setState({
      keyword
    })
    const { dispatch } = this.props;
    return dispatch('refresh', { keyword, sort: this.state.sort });
  };
   // 右侧 - 步骤条
   renderRight = () => {
    // const { pageData = [] } = this.props.search.indexUsers || { pageData: [] };
    return (
      <>
      {
        // pageData?.length > 0 && (
          <div className={styles.searchRight}>
            <div className={styles.section}>
              <SectionTitle title="活跃用户" onShowMore={this.redirectToSearchResultUser}/>
              {/* <ActiveUsers data={pageData} onItemClick={this.onUserClick}/> */}
            </div>
            <Copyright/>
          </div>
        // )
      }
      </>
    )
  }
  // 中间 -- 潮流话题 活跃用户 热门内容
  renderContent = () => {
    // const { pageData = [] } = this.props.search.topics || { pageData: [] };
    const { pageData = [], currentPage = 0, totalPage = 0 } = this.props.topic?.topics || {}
    return (
      <div className={styles.searchContent}>
        <div className={styles.section}>
          <SectionTitle
            title="潮流话题"
            isShowMore={false}
            icon={{ type: 1, name: 'StrongSharpOutlined' }}
          />
          {pageData?.map((item, index, arr) => (
            <TopicItem data={item} key={index} onClick={this.onTopicClick}/>
          ))}
        </div>
      </div>
    )
  }
  render() {
    const { currentPage, totalPage } = this.props.topic?.topics || {}
    return (
      <List className={styles.searchWrap} noMore={currentPage >= totalPage} onRefresh={this.fetchMoreData}>
        <BaseLayout
          onSearch={this.onSearch}
          right={ this.renderRight }
        >
          { this.renderContent }
        </BaseLayout>
      </List>
    );
  }
}
export default withRouter(IndexPCPage);
