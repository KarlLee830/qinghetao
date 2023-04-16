import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import BaseLayout from '@components/base-layout';
import SearchInput from '@components/search-input';
import TopicHeader from './components/topic-header'
import TopicItem from '@components/topic-item'
import styles from './index.module.scss';


@inject('site')
@inject('user')
@inject('topic')
@observer
class TopicH5Page extends React.Component {
  state = {
    keyword: '',
    sort: ''
  }
  onSearch = (keyword = '') => {
    this.setState({
      keyword
    })
    const { dispatch } = this.props;
    return dispatch('refresh', { keyword, sort: this.state.sort });
  };

  onFilter = (id) => {
    this.setState({
      sort: id
    })
    const { dispatch } = this.props;
    return dispatch('refresh', { keyword: this.state.keyword, sort: id });
  };

  redirectTopicDetails = (id) => {
    this.props.router.push(`/topic/topic-detail/${id}`);
  };
  fetchMoreData = () => {
    const { dispatch } = this.props;

    return dispatch('moreData', this.state);
  }
  render() {
    const { pageData = [], currentPage = 0, totalPage = 0 } = this.props.topic?.topics || {}

    return (
      <BaseLayout
          onRefresh={this.fetchMoreData}
          noMore={currentPage >= totalPage}
      >
        <SearchInput onSearch={this.onSearch} onCancel={this.onCancel} isShowBottom={false} searchWhileTyping/>
        <TopicHeader onClick={this.onFilter} />
        <div className={styles.wrapper}>
          {
            pageData?.map((item, index) => (
              <TopicItem data={item} key={index} onClick={() => this.redirectTopicDetails(item.topicId)}/>  
            ))
          }
        </div>
      </BaseLayout>
    );
  }
}
export default withRouter(TopicH5Page);
