import React from 'react';
import Taro from '@tarojs/taro';
import IndexPage from '@layout/index/index';
import Page from '@components/page';
import withShare from '@common/utils/withShare/withShare'
import { inject, observer } from 'mobx-react'
import { handleString2Arr } from '@common/utils/handleCategory';
import { priceShare } from '@common/utils/priceShare';
import { updateThreadAssignInfoInLists } from '@common/store/thread-list/list-business';

@inject('site')
@inject('index')
@inject('threadList')
@inject('user')
@inject('baselayout')
@withShare()
@observer
@withShare({
  needLogin: true,
  showShareTimeline: true
})
class Index extends React.Component {
  state = {
    isError: false,
    errorText: '加载失败'
  }

  constructor(props) {
    super(props);
    const { index, threadList, site } = this.props;
    threadList.registerList({ namespace: index.namespace });
    const { webConfig } = site || {};
    const { other } = webConfig || {};
    const { threadTab } = other || {};
    const { filter } = index;
    // 所有:0,1 推荐:2 精华:3 已关注:4
    const categoryids = threadTab === 2 ? ['default'] : filter.categoryids;
    const sequence = threadTab === 2 ? '1' : filter.sequence;
    const attention = threadTab === 4 ? 1 : filter.attention;
    const essence = threadTab === 3 ? 1 : filter.essence;
    index.setFilter({ ...filter, categoryids, attention, essence, sequence });
  }

  componentDidHide() {
    const { baselayout } = this.props;

    const playingAudioDom = baselayout?.playingAudioDom;

    if(playingAudioDom) {
      baselayout.playingAudioDom.pause();
      baselayout.playingAudioDom = null;
    }
  }

  getShareData(data) {
    const { site, user } = this.props
    const siteName = site.webConfig?.setSite?.siteName || ''
    const defalutPath = 'pages/index/index'
    const nickname = user?.userInfo?.nickname || ''
    const defalutTitle = `${nickname}邀请你加入${siteName}`
    if (data.from === 'timeLine') {
      return {
        title: defalutTitle
      }
    }
    if (data.from === 'menu') {
      return {
        title: defalutTitle,
        path: defalutPath
      }
    }
    const { title, path, comeFrom, threadId, isAnonymous, isPrice } = data
    if (comeFrom && comeFrom === 'thread') {
      const { user } = this.props
      this.props.index.updateThreadShare({ threadId }).then(result => {
        if (result.code === 0) {
          updateThreadAssignInfoInLists(threadId, { updateType: 'share', updatedInfo: result.data, user: user.userInfo });
        }
      });
    }
    return priceShare({isAnonymous, isPrice, path}) ||
    {
      title,
      path
    }
  }

  page = 1;
  prePage = 10;


  loadData = () => {
    const { index } = this.props
    const { essence = 0, sequence = 0, attention = 0, sort = 1 } = index.filter;

    const newTypes = handleString2Arr(index.filter, 'types');
    const categoryIds = handleString2Arr(index.filter, 'categoryids');

    // 重置错误信息
    this.props.index.resetErrorInfo()
    this.props.index.getReadCategories();
    this.props.index.fetchThreadTypelist();
    this.props.index.getRreadStickList(categoryIds);
    this.props.index.getReadThreadList({
        sequence,
        filter: { categoryids: categoryIds, types: newTypes, essence, attention, sort }
    }).then(() => {
      // 若第一次接口请求成功，则开始第二次请求，提高数据渲染效率
      this.dispatch('moreData');
    });
  }

  componentDidShow() {
    const { threads } = this.props.index || {}
    if (!threads?.pageData?.length) {
      this.loadData()
    }
  }

  dispatch = async (type, data = {}) => {
    const { index } = this.props;
    const newData = {...index.filter, ...data}
    const { essence, sequence, attention, sort, page } = newData;

    const newTypes = handleString2Arr(newData, 'types');

    const categoryIds = handleString2Arr(newData, 'categoryids');

    if (type === 'click-filter') { // 点击tab
      this.page = 1;
      return await index.screenData({ filter: { categoryids: categoryIds, types: newTypes, essence, attention, sort }, sequence, page: this.page, isMini: true });
    } if (type === 'moreData') {
      this.page += 1;
      return await index.getReadThreadList({
        perPage: this.prePage,
        page: this.page,
        filter: { categoryids: categoryIds, types: newTypes, essence, attention, sort },
        sequence,
      });
    } if (type === 'refresh-recommend') {
      await index.getRecommends({ categoryIds });
    } else if (type === 'update-page') {// 单独更新页数
      this.page = page
    } else if (type === 'refresh-thread') { // 点击帖子更新数的按钮，刷新帖子数据
      this.page = 1;
      return await index.getReadThreadList({ filter: { categoryids: categoryIds, types: newTypes, essence, attention, sort }, sequence, page: this.page, });
    }
  }

  setNavigationBarStyle = () => {
    Taro.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#ffffff'
    });
  }

  resetData = () => {
    this.props.index.resetHomeThreadData()
    this.page = 1
  }

  componentDidMount() {
    this.setNavigationBarStyle();

    this.resetData()
    this.props.user.onLoginCallback = () => {
      this.resetData()
    }
  }

  render() {
    return (
      <Page>
        <IndexPage dispatch={this.dispatch} />
      </Page>
    );
  }
}

// eslint-disable-next-line new-cap
export default Index;
