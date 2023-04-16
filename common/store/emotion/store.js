import { observable } from 'mobx';
class IndexStore {
  constructor() {}

  /**
   * 表情列表
   */
   @observable emojis = [];

}

export default IndexStore;