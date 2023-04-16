export const MINI_SHOP_TYPE = 11; // 小商店类型
export const PLATFORM_SHOP_TYPE = 10; // 原有商品类型

export const isShowMiniShopTab = (props) => {
  const { siteData = {} } = props || {};
  const pluginConfig = siteData.pluginConfig || [];

  const shopPluginConfig = pluginConfig.find((currentPluginConfig) => {
    if (currentPluginConfig.app_id === '61540fef8f4de8') {
      return currentPluginConfig;
    }
  });

  const { setting = {} } = shopPluginConfig  || {};

  if (
    setting?.publicValue?.wxshopOpen &&
    setting?.publicValue?.wxAppId
  ) {
    return true;
  }

  return false;
};
