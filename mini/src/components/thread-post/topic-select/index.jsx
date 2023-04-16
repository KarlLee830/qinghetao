/**
 * 话题选择
 */
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import Input from '@discuzqsdk/design/dist/components/input/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import styles from './index.module.scss';

import List from '@components/list';

@inject('threadPost')
@observer
class TopicSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keywords: '', // 搜索关键字
      page: 1,
      perPage: 20,
      finish: false,
    };
    this.timer = null;
  }

  // 初始化话题请求
  async componentDidMount() {
    this.fetchTopics();
  }

  // 更新搜索关键字
  updateKeywords = (val = "") => {
    this.setState({ keywords: val, page: 1, finish: false });
    this.searchInput();
  }

  // 搜索话题
  searchInput = () => {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.fetchTopics();
    }, 300);
  }

  // 请求
  async fetchTopics() {
    // 1 设置参数
    const { fetchTopic } = this.props.threadPost;
    const { page, perPage, keywords } = this.state;
    const params = { page, perPage };
    params.filter = {};
    if (keywords) {
      params.filter.content = keywords;
    } else {
      params.filter.recommended = 1;
    }
    // 2 发起请求
    const ret = await fetchTopic(params);
    const { code, data } = ret;
    // 3 请求完成
    if (code === 0) {
      this.setState({
        page: page + 1,
        finish: page >= data.totalPage
      });
    } else {
      this.setState({ finish: true });
      Taro.showToast({ title: ret.msg, icon: 'none' });
    }
  }

  // 返回发帖页
  cancel = () => {
    Taro.navigateBack();
  }

  // 点击话题，选中项没有话题内容，则采用当前关键字为新话题
  handleItemClick = (item) => {
    const { keywords } = this.state;
    const { postData: { contentText: text }, setPostData, cursorPosition, setCursorPosition } = this.props.threadPost;
    const topic = ` #${item.content || keywords}# `
    const contentText = text.slice(0, cursorPosition) + topic + text.slice(cursorPosition);;
    setPostData({ contentText });
    setCursorPosition(cursorPosition + topic.length);
    this.cancel();
  }

  // 渲染项
  renderItem = (item) => (
    <View className={styles['topic-item']} onClick={() => this.handleItemClick(item)}>
      <View className={styles['topic-item__inner']} >
        <View className={styles['item-left']}>
          <View className={styles.name}>#{item.content}#</View>
        </View>
        <View className={styles['item-right']}>
          {item.newTopic ? item.newTopic : `${item.viewCount}热度`}
        </View>
      </View>
    </View>
  );

  render() {
    const { topics = [], showNewTopic } = this.props.threadPost;
    const { keywords, finish } = this.state;

    return (
      <View className={styles.wrapper}>

        {/* top */}
        <View className={styles.header}>
          <View className={styles['input-box']}>
            <View className={styles['icon-box']}>
              <Icon className={styles['search-icon']} name="SearchOutlined" size={16}></Icon>
            </View>
            <Input
              value={keywords}
              placeholder='请选择或直接输入话题'
              onChange={e => this.updateKeywords(e.target.value)}
            />
            {keywords &&
              <View className={styles['icon-box']} onClick={() => this.updateKeywords()}>
                <Icon className={styles['delete-icon']} name="WrongOutlined" size={16}></Icon>
              </View>
            }
          </View>
          <View className={styles['btn-cancel']} onClick={this.cancel}>取消</View>
        </View>

        {/* list */}
        <List
          className={styles.list}
          noMore={finish}
          onRefresh={() => this.fetchTopics()}
          hasOnScrollToLower={true}
        >
          {showNewTopic && this.renderItem({ content: keywords, newTopic: '新话题' })}
          {topics.map(item => (
            <React.Fragment key={item.topicId}>
              {this.renderItem(item)}
            </React.Fragment>
          ))}
        </List>

      </View >
    );
  }
}

export default TopicSelect;
