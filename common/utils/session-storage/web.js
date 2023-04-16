export default class Storage {
  constructor({ storageType }) {

    this.storage = null;

    const isBrowser = typeof window !== 'undefined';
    if(storageType === "local") {
      this.storage = isBrowser ? window.localStorage : {
        setItem: () => {},
        getItem: () => {}
      };
    } else {
      this.storage = isBrowser ? window.sessionStorage : {
        setItem: () => {},
        getItem: () => {}
      };
    }
  }

  /**
   * 设置数据项
   * @param {string} key 键
   * @param {any} value 值
   */
  set(key, value) {
    try {
        this.storage.setItem(key, value);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * 得到数据项
   * @param {string} key 键
   */
  get(key) {
    try {
        return this.storage.getItem(key);
    } catch (error) {
      console.error(error);
    }
  }
}