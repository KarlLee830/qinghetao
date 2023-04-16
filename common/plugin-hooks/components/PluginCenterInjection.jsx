let PluginCenterInjection = () => {};

if (process.env.DISCUZ_ENV === 'mini') {
  const DZQPluginCenterInjection = require('@discuzqsdk/plugin-center/dist/components/DZQPluginCenterInjection');
  PluginCenterInjection = DZQPluginCenterInjection.default;
}

if (process.env.DISCUZ_ENV === 'web') {
  const DZQPluginCenterInjection = require('../../../web/utils/DZQPluginCenterInjectionPolyfill');
  PluginCenterInjection = DZQPluginCenterInjection.default;
}

export default PluginCenterInjection;
