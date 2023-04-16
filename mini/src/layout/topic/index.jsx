import React from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import SearchInput from '@components/search-input';
import List from '@components/list';
import TopicHeader from './components/topic-header'
import TopicItem from './components/topic-item'
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

@inject('site')
@inject('user')
@inject('topic')
@observer
class TopicPage extends React.Component {
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
    Taro.navigateTo({
      url: `/subPages/topic/topic-detail/index?id=${id || ''}`
    })
    // this.props.router.push(`/topic/topic-detail/${id}`);
  };
  fetchMoreData = () => {
    const { dispatch } = this.props;

    return dispatch('moreData', this.state);
  }
  render() {
    const { pageData = [], currentPage = 0, totalPage = 0 } = this.props.topic?.topics || {}
    return (
      <View className={styles.topicWrap}>
        <View className={styles.topBox}>
          <SearchInput onSearch={this.onSearch} onCancel={this.onCancel} searchWhileTyping/>
        </View>
       <TopicHeader onClick={this.onFilter} />
        
        <List className={styles.list} noMore={currentPage >= totalPage} onRefresh={this.fetchMoreData}>
          {
            pageData?.map((item, index) => (
              <TopicItem data={item} key={index} onClick={() => this.redirectTopicDetails(item.topicId)}/>  
            ))
          }
        </List>
      </View>
    );
  }
}
export default TopicPage;
