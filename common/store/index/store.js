import { observable, computed } from 'mobx';
import listProxy from '../thread-list/proxy';
import ThreadListStore from  '../thread-list/list';

class IndexStore {
  constructor() {
    this.threadList = new ThreadListStore();
  }

  @observable categories = null;

  @observable sticks = null;

  // @observable threads = null;

  @observable drafts = null;

  @observable latestReq = 0;

  @observable namespace = 'home';

  // 二维数组，小程序使用
  @computed get TwoDThreads() {
    const newData = [];
    const homeData = this.threadList.lists?.[this.namespace];
    if (homeData?.data) {
      Object.values(homeData?.data).forEach((pageData) => {
        newData.push(pageData);
      });
    }

    return newData;
  }

  @computed get threads() {
    let newData = null;

    const homeData = this.threadList.lists?.[this.namespace];
    const attrs = this.threadList.lists?.[this.namespace]?.attribs;
    if (homeData?.data) {
      const pageData = this.threadList.listAdapter(homeData);
      newData = {
        pageData,
        ...attrs,
      };
    }

    const params = {
      listStore: this.threadList,
      namespace: this.namespace,
    };

    return listProxy(newData, params);
  }
  set threads(data) {
    if (!data) {
      this.threadList.clearList({ namespace: this.namespace });
      return;
    }
    this.threadList.setList({
      namespace: this.namespace,
      data: { data },
      page: data.currentPage,
    });
  }

  @computed get hasThreadsData() {
    const pageData = this.threadList.getList({ namespace: this.namespace });

    return !!pageData?.length;
  }

  // 是否出现推荐选项
  @observable needDefault = false

  @computed get categoriesNoAll() {
    return (this.categories || []).filter(item => item.name !== '全部' && item.canCreateThread);
  }

  @computed get categoriesNames() {
    const categoriesNoAll = (this.categories || []).filter(item => item.name !== '全部');
    const nameArr = [];
    categoriesNoAll.forEach((item) => {
      nameArr.push({
        categoryId: item.categoryId,
        name: item.name,
      });
      item.children.forEach((child) => {
        nameArr.push({
          categoryId: child.categoryId,
          name: `${item.name}/${child.name}`,
        });
      });
    });
    return nameArr;
  }

  @observable filter = {
    categoryids: ['all'], // 这里的逻辑如果更改，记得需要更改下面的计算属性：isCurrentAllCategory
    sequence: 0,
    sort: 1,
    attention: 0,
    types: 'all',
    essence: 0,
  }

  // 首页当前分类是否是全部分类，这里会涉及到 action：isNeedAddThread 的判断，会涉及到发帖之后是否添加数据到首页的逻辑
  @computed
  get isCurrentAllCategory() {
    const { categoryids = [] } = this.filter || {};
    return categoryids.indexOf('all') !== -1;
  }

  // 解决小程序popup被tabBar遮挡的问题
  @observable hiddenTabBar = false

  // 小程序scroll-view被scroll-view嵌套，子元素不能使用同名属性来触发事件
  @observable hasOnScrollToLower = true; // 值为false时，第一层嵌套onScrollToLower被设置为null用于执行下一层onScrollToLower

  // @observable threadError = {
  //   isError: false,
  //   errorText: '加载失败',
  // };

  // 首页帖子报错信息
  @computed get threadError() {
    const requestError = this.threadList.lists?.[this.namespace]?.requestError;
    return requestError;
  }
  set threadError(data) {
    this.threadList.lists[this.namespace].requestError = data;
  }

  // 首页分类报错信息
  @observable categoryError = {
    isError: false,
    errorText: '加载失败',
  };

  @observable recommends = null;
  @observable recommendsStatus = 'none'

  @observable topMenuIndex = '0'

  // 首页列表筛选帖子类型数据
  @observable threadTypelist = [];
}

export default IndexStore;
