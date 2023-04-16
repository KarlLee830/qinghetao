import { observable, computed } from 'mobx';
import listProxy from '../thread-list/proxy';
import ThreadListStore from  '../thread-list/list';

class TopicStore {
  constructor() {
    this.threadList = new ThreadListStore();
  }

  @observable topics = null
  @observable topicDetail = null

  @observable namespace = 'topic'
  @computed get topicThreads() {
    let newData = {};
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
  set topicThreads(data) {
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
}

export default TopicStore;
