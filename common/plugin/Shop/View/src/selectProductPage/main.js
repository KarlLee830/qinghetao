import Component from './adapter';
import config from '../../../config.json';

export default class SelectProductPage {
  static pluginName = config.name_en // 插件名称
  static version = config.version // 插件版本
  static type = config.type; // 插件类型
  static appid = config.app_id; // appid
  static author = config.author; // 作者
  static target = config.view.selectProductPage.target // 插件使用目标
  static hookName = config.view.selectProductPage.hookName // 钩子名称
  static platform = config.view.selectProductPage.platform;
  static component = <Component/> // 需要渲染的组件
  static options = {} // 需要在注入时提供的额外数据
  static path = config.view.selectProductPage.path;
  static miniPageConfig = config.view.selectProductPage.miniPageConfig;
}
