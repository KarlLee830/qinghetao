import Taro from '@tarojs/taro';

export default class Storage {
  /**
   * 设置数据项
   * @param {string} key 键
   * @param {any} value 值
   */
  set(key, value) {
    try {
        Taro.setStorageSync(key, value);
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
        return Taro.getStorageSync(key);
    } catch (error) {
      console.error(error);
    }
  }
}