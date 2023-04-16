import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '@layout/index/h5';
import IndexPCPage from '@layout/index/pc';
import { readCategories, readStickList, readThreadList, readRecommends, readTypelist } from '@server';
import { handleString2Arr } from '@common/utils/handleCategory';
import HOCFetchSiteData from '../middleware/HOCFetchSiteData';
import ViewAdapter from '@components/view-adapter';
import isServer from '@common/utils/is-server';
import browser from '@common/utils/browser';
import getRouterCategory from '@common/utils/getRouterCategory';

@inject('site')
@inject('index')
@inject('user')
@inject('baselayout')
@inject('vlist')
@inject('threadList')
@observer
class Index extends React.Component {

  state = {
    categoryError: false,
    categoryErrorText: '',
  }

  page = 1;
  prePage = 10;
  static async getInitialProps(ctx, { user, site }) {
    const { platform } = site;
    const result = getRouterCategory(ctx, site);
    const { essence = 0, sequence = 0, attention = 0, sort = 1 } = result;
    const newTypes = handleString2Arr(result, 'types');

    const categoryIds = handleString2Arr(result, 'categoryids');

    const categories = await readCategories({}, ctx);
    const threadTypelist = await readTypelist();
    const sticks = await readStickList({ params: { categoryIds } }, ctx);
    const threads = await readThreadList({
      params: {
        // 为优化seo，对ssr部署时，获取50条数据，普通用户10条
        perPage: process.env.NODE_ENV !== 'development' && process.env.DISCUZ_RUN === 'ssr' ? 100 : 10,
        page: 1,
        sequence,
        filter: { categoryids: categoryIds, types: newTypes, essence, attention, sort },
      },
    }, ctx);


    // 只有pc下才去加载推荐内容
    let recommend = null;
    if (platform === 'pc') {
      recommend = await readRecommends({ params: { categoryIds } })
    }

    return {
      serverIndex: {
        categories: categories && categories.code === 0 ? categories.data : null,
        sticks: sticks && sticks.code === 0 ? sticks.data : null,
        threads: threads && threads.code === 0 ? threads.data : null,
        recommend: recommend && recommend.code === 0 ? recommend.data : null,
        threadTypelit: threadTypelist && threadTypelist.code === 0 ? threadTypelist.data : [],
      },
    };
  }

  constructor(props) {
    super(props);
    const { serverIndex, index, threadList } = this.props;
    threadList.registerList({ namespace: index.namespace });

    this.handleRouterCategory()
    // console.log(serverIndex.threads);
    // const { serverIndex, index } = this.props;
    // 初始化数据到store中
    serverIndex && serverIndex.categories && index.setCategories(serverIndex.categories);
    serverIndex && serverIndex.sticks && index.setSticks(serverIndex.sticks);
    serverIndex && serverIndex.threads && index.setThreads(serverIndex.threads);
    serverIndex && serverIndex.threads && index.setRecommends(serverIndex.recommend);
    serverIndex && serverIndex.threadTypelist && index.setThreadTypelist(serverIndex.threadTypelist);
  }

  componentDidMount() {
    const { index } = this.props;
    const { essence = 0, sequence = 0, attention = 0, sort = 1 } = index.filter;

    let newTypes = handleString2Arr(index.filter, 'types');

    let categoryIds = handleString2Arr(index.filter, 'categoryids');

    // 当服务器无法获取数据时，触发浏览器渲染
    const hasCategoriesData = !!index.categories;
    const hasSticksData = !!index.sticks;

    if (!hasCategoriesData) {
      this.props.index.getReadCategories();
    }
    this.props.index.fetchThreadTypelist();

    if (!hasSticksData) {
      this.props.index.getRreadStickList(categoryIds);
    }

    if (!index.hasThreadsData) {
      this.props.index.getReadThreadList({
        sequence,
        filter: { categoryids: categoryIds, types: newTypes, essence, attention, sort }
      });
    } else {
      // 如果store中有值，则需要获取之前的分页数
      this.page = index.threads.currentPage || 1
    }
  }

  // 通过地址栏获取到当前分类信息
  handleRouterCategory = () => {
    // 识别通过分享过来的url
    // 若包含categoryId参数，则定位到具体的categoryId数据
    const { router, index, site } = this.props;
    // 是否显示了推荐tab
    const isShowRecommend = site.checkSiteIsOpenDefautlThreadListData();

    const result = getRouterCategory(router, site);
    const { categoryids, sequence, attention, essence } = result;
    // pc端topmenu的选中
    if (sequence === '1') index.topMenuIndex = `${sequence}`;
    else if (essence === 1) index.topMenuIndex = isShowRecommend ? '2' : '1';
    else if (attention === 1) index.topMenuIndex = isShowRecommend ? '3' : '2';
    index.setFilter(result);
    !isServer() && this.setUrl(categoryids, sequence);
  }

  // 根据选中的筛选项，设置地址栏
  setUrl = (categoryIds = [], sequence = 0) => {
    const url = ((categoryIds?.length && categoryIds.join('') !== 'all')
      || parseInt(sequence, 10) !== 0)
      ? `/cate/${categoryIds.join('_')}/seq/${sequence}` : '/';
    this.props.router.replace(url);
  }

  dispatch = async (type, data = {}) => {
    const { index } = this.props;
    const newData = {...index.filter, ...data}
    const { essence, sequence, attention, sort, page } = newData;

    let newTypes = handleString2Arr(newData, 'types');

    let categoryIds = handleString2Arr(newData, 'categoryids');

    // 每次请求前，先判断错误状态，并重置
    if (this.props.index?.threadError?.isError) {
      this.props.index.threadError = {
        isError: false,
        errorText: ''
      }
    }

    if (type === 'click-filter') { // 点击tab
      this.setUrl(newData.categoryids, sequence)

      this.page = 1;
      this.props.baselayout.setJumpingToTop();
      this.props.vlist.setPosition(0);
      await index.screenData({ filter: { categoryids: categoryIds, types: newTypes, essence, attention, sort }, sequence, page: this.page, });
    } else if (type === 'moreData') {
      const { currentPage = 0 } = this.props.index.threads || {}
      this.page += 1;

      if (currentPage < this.page) {
        return await index.getReadThreadList({
          perPage: this.prePage,
          page: this.page,
          filter: { categoryids: categoryIds, types: newTypes, essence, attention, sort },
          sequence,
        });
      } else {
        this.page = currentPage
        return Promise.resolve()
      }
    } else if (type === 'refresh-recommend') {
      await index.getRecommends({ categoryIds });
    } else if (type === 'update-page') {// 单独更新页数
      this.page = page
    } else if (type === 'refresh-thread') { // 点击帖子更新数的按钮，刷新帖子数据
      this.page = 1;
      return await index.getReadThreadList({ filter: { categoryids: categoryIds, types: newTypes, essence, attention, sort }, sequence, page: this.page, });
    }
  }

  render() {
    const { categoryName = '' } = this.props.index || {}
    const { canPublish } = this.props;
    const { setSite: { siteTitle } = {} } = this.props.site.webConfig || {}
    return <ViewAdapter
            h5={<IndexH5Page dispatch={this.dispatch} canPublish={canPublish}/>}
            pc={<IndexPCPage dispatch={this.dispatch} canPublish={canPublish}/>}
            title={categoryName || siteTitle || ""}
          />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(Index, (pass) => {
  // 因部署方式的问题，所有路径第一次访问都会访问index.html，导致会出现首页渲染出来之后跳转到制定的url地址，为了防止这种情况，对首页的渲染做一次判断，如果url不是首页连接，将不渲染首页。
  if (!isServer() && !browser.env('uc')) { // uc浏览器存在异常，首页不做判断
    const pathname = window.location.pathname;
    if (pathname === '/' || pathname === '/index' || pathname.indexOf('/cate/') > -1) {
      return true;
    } else {
      return false;
    }
  }
  return pass;
});
