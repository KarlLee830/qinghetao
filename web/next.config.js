const nextConfig = require('@discuzqsdk/cli/config/next');

module.exports = nextConfig((config) => {
    config.productionBrowserSourceMaps = false;
    config.crossOrigin = 'anonymous';
    // console.log(config);
    // config.devIndicators = {
    //     autoPrerender: false,
    // }
    // config.plugins.push(new BundleAnalyzerPlugin({ analyzerPort: 8919 }));
    return config;
});