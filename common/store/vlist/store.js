import { observable } from 'mobx';
class IndexStore {
  constructor() {}

  @observable home = 0;

  @observable cache = null;
}

export default IndexStore;
