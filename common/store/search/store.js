import { observable, computed } from 'mobx';
import listProxy from '../thread-list/proxy';
import ThreadListStore from  '../thread-list/list';

class SearchStore {
  constructor() {
    this.threadList = new ThreadListStore();
  }

  // 发现页
  @observable indexTopics = null;
  @observable indexUsers = null;
  @observable indexThreadsNamespace = 'search';
  @observable indexThreadsLoading = true;
  @computed get indexThreads() {
    let newData = null;
    const homeData = this.threadList.lists?.[this.indexThreadsNamespace];
    const attrs = this.threadList.lists?.[this.indexThreadsNamespace]?.attribs;
    if (homeData?.data) {
      const pageData = this.threadList.listAdapter(homeData);
      newData = {
        pageData,
        ...attrs,
      };
    }
    const params = {
      listStore: this.threadList,
      namespace: this.indexThreadsNamespace,
    };

    return listProxy(newData, params);
  }
  set indexThreads(data) {
    if (!data) {
      this.threadList.clearList({ namespace: this.indexThreadsNamespace });
      return;
    }
    this.threadList.setList({
      namespace: this.indexThreadsNamespace,
      data: { data },
      page: data.currentPage,
    });
  }
  // 发现页-错误信息
  @observable indexTopicsError = { isError: false, errorText: '' };
  @observable indexUsersError = { isError: false, errorText: '' };
  @computed get indexThreadsError() {
    const requestError = this.threadList.lists?.[this.indexThreadsNamespace]?.requestError;
    return requestError;
  }
  set indexThreadsError(data) {
    if (this.threadList.lists?.[this.indexThreadsNamespace]) {
      this.threadList.lists[this.indexThreadsNamespace].requestError = data;
    } 
  }

  // 更多页
  @observable topics = null;
  @observable users = null;
  @observable threadsNamespace = 'search/result-post';
  @computed get threads() {
    let newData = null;
    const homeData = this.threadList.lists?.[this.threadsNamespace];
    const attrs = this.threadList.lists?.[this.threadsNamespace]?.attribs;
    if (homeData?.data) {
      const pageData = this.threadList.listAdapter(homeData);
      newData = {
        pageData,
        ...attrs,
      };
    }
    const params = {
      listStore: this.threadList,
      namespace: this.threadsNamespace,
    };

    return listProxy(newData, params);
  }
  set threads(data) {
    if (!data) {
      this.threadList.clearList({ namespace: this.threadsNamespace });
      return;
    }
    this.threadList.setList({
      namespace: this.threadsNamespace,
      data: { data },
      page: data.currentPage,
    });
  }
  // 更多页-错误信息
  @observable topicsError = { isError: false, errorText: '' };
  @observable usersError = { isError: false, errorText: '' };
  @computed get threadsError() {
    const requestError = this.threadList.lists?.[this.threadsNamespace]?.requestError;
    return requestError;
  }
  set threadsError(data) {
    if (this.threadList.lists?.[this.threadsNamespace]) {
      this.threadList.lists[this.threadsNamespace].requestError = data;
    }
  }

  // 搜索页
  @observable searchTopics = null;
  @observable searchUsers = null;
  @observable searchThreadsNamespace = 'search/result';
  @computed get searchThreads() {
    let newData = null;
    const homeData = this.threadList.lists?.[this.searchThreadsNamespace];
    const attrs = this.threadList.lists?.[this.searchThreadsNamespace]?.attribs;
    if (homeData?.data) {
      const pageData = this.threadList.listAdapter(homeData);
      newData = {
        pageData,
        ...attrs,
      };
    }
    const params = {
      listStore: this.threadList,
      namespace: this.searchThreadsNamespace,
    };

    return listProxy(newData, params);
  }
  set searchThreads(data) {
    if (!data) {
      this.threadList.clearList({ namespace: this.searchThreadsNamespace });
      return;
    }
    this.threadList.setList({
      namespace: this.searchThreadsNamespace,
      data: { data },
      page: data.currentPage,
    });
  }
  // 搜索页-错误信息
  @observable searchTopicsError = { isError: false, errorText: '' };
  @observable searchUsersError = { isError: false, errorText: '' };
  @computed get searchThreadsError() {
    const requestError = this.threadList.lists?.[this.searchThreadsNamespace].requestError;
    return requestError;
  }
  set searchThreadsError(data) {
    if (this.threadList.lists?.[this.searchThreadsNamespace]) {
      this.threadList.lists[this.searchThreadsNamespace].requestError = data;
    }
  }

  @observable currentKeyword = null; // 当前搜索页正在搜索的关键词

  @observable currentTopicKeyword = null; // 用于H5，当前潮流话题页正在搜索的关键词

  @observable currentUserKeyword = null; // 用于H5，当前活跃用户页正在搜索的关键词

  @observable currentPostKeyword = null; // 用于H5，当前热门内容页正在搜索的关键词

  @observable searchNoData = false; // 如果没有搜索到结果为true
}

export default SearchStore;
