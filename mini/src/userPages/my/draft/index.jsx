import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import classNames from 'classnames';
import { THREAD_LIST_FILTER_COMPLEX } from '@common/constants/index';

import styles from './index.module.scss';

import Page from '@components/page';
import SliderScroll from '@components/slider-scroll';
import ThreadCenterView from '@components/thread/ThreadCenterView';

@inject('index')
@inject('user')
@inject('thread')
@inject('plugin')
@observer
class Index extends Component {
  page = 1;
  perPage = 10;
  constructor(props) {
    super(props);
    Taro.hideShareMenu();
  }

  componentDidShow() {
    this.fetchData();
  }

  componentWillUnmount() {
    this.props.index.drafts = null;
  }

  fetchData = async (isMore) => {
    const { index } = this.props;
    if (isMore) this.page += 1;
    else this.page = 1;
    await index.getReadThreadList({
      isDraft: true,
      page: this.page,
      perPage: this.perPage,
      filter: { complex: THREAD_LIST_FILTER_COMPLEX.draft },
    });
    return;
  };

  handleEdit = (item) => Taro.navigateTo({ url: `/indexPages/thread/post/index?id=${item.threadId}` });

  handleDelete = async (item) => {
    // 删除草稿事件
    const { thread, index } = this.props;
    Taro.showToast({
      title: '删除中...',
      icon: 'loading',
    });
    const res = await thread.delete(item.threadId);
    Taro.hideToast();
    if (res.code === 0) {
      const data = (index.drafts?.pageData || []).filter((elem) => elem.threadId !== item.threadId);
      const total = index.drafts?.totalCount - 1;
      index.setDrafts({ ...index.drafts, totalCount: total, pageData: data });
    } else {
      Toast.error({ content: res.msg });
    }
  };

  // 渲染草稿单项
  renderItem = ({ item, isLast }) => (
      <View className={classNames(styles.item, { [styles['border-none']]: isLast })}>
        <ThreadCenterView
          data={item}
          user={this.props.user}
          onClick={() => this.handleEdit(item)}
          updateThread={this.props.thread.updateThread.bind(this.props.thread)}
          updateListThreadIndexes={this.props.index.updateListThreadIndexes.bind(this.props.index)}
        />
        <View className={styles['item-time']} onClick={() => this.handleEdit(item)}>
          编辑于&nbsp;{item.updatedAt}
        </View>
      </View>
    );

  // 处理列表数据
  getRenderList = (data = []) => data.map((item) => ({ id: item.threadId, ...item }));

  render() {
    const { currentPage, totalPage, totalCount, pageData } = this.props.index?.drafts || {};
    const topCard = <View className={styles.header}>{totalCount || 0}&nbsp;条草稿</View>;

    return (
      <Page>
        <View className={styles.wrapper}>
          <SliderScroll
            topCard={topCard}
            list={this.getRenderList(pageData)}
            RenderItem={this.renderItem}
            noMore={currentPage >= totalPage}
            onPullDown={() => this.fetchData(false)}
            onScrollBottom={() => this.fetchData(true)}
            onBtnClick={this.handleDelete}
          />
        </View>
      </Page>
    );
  }
}

export default Index;
