import React from 'react';
import Taro, { eventCenter, getCurrentInstance } from '@tarojs/taro';
import { Icon, Dialog, Toast } from '@discuzqsdk/design';

export default class ShopPostEntry extends React.Component {
  constructor(props) {
    super(props);
  }

  $instance = getCurrentInstance();

  handleIconClick = () => {
    const currentPluginStore = this.props.pluginAction.get('shop');

    if (currentPluginStore) {
      this.props.pluginAction.set('shop', {
        ...currentPluginStore,
        renderData: this.props.renderData,
      });
    } else {
      this.props.pluginAction.set('shop', {
        renderData: this.props.renderData,
      });
    }

    Taro.navigateTo({ url: '/pluginPages/selectProduct/index' });
  };

  isShowShopIcon = () => {
    const { siteData, _pluginInfo } = this.props;
    const { pluginConfig } = siteData;
    if (!pluginConfig) return false;
    const [act] = (pluginConfig || []).filter(item => item.app_id === _pluginInfo.options.tomId);

    const { webConfig: { other: { threadOptimize } } } = siteData;

    // 如果开启了小程序不显示商品贴，则做隐藏
    if (!threadOptimize) return false;

    if (act?.authority?.canUsePlugin) return true;
    
    return false;
  };

  render() {
    if (!this.isShowShopIcon()) return null;
    return (
      <>
        <Icon onClick={this.handleIconClick} name="ShoppingCartOutlined" size="20" />
      </>
    );
  }
}
