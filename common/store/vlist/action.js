import { action } from 'mobx';
import IndexStore from './store';

class IndexAction extends IndexStore {
  constructor(props) {
    super(props);
  }

  /**
   * 设置跳回页面头部
   */
  @action
  setPosition(position) {
    this.home = position;
  }

  @action
  setCache(cache) {
    this.cache = cache;
  }

  /**
   * 设置跳回页面头部
   */
  @action
  resetPosition() {
    this.home = -1;
  }
}

export default IndexAction;
