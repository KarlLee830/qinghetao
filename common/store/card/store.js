import { observable } from 'mobx';


class ThreadStore {
  constructor(props) {
    this.threadData = props?.thread;
  }
  @observable threadData = null; // 帖子信息
  @observable isReady = false;
  @observable imgReady = false;
  @observable imgReadyLength = 0;
}

export default ThreadStore;
