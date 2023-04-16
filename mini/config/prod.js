const miniConfig = require('../src/app.config');
const getDefinePlugin = require('@discuzqsdk/cli/config/taro/getDefinePlugin');
const getDZQPluginLoader = require('@discuzqsdk/cli/config/taro/getDZQPluginLoader');

const path = require('path');
module.exports = {
  env: {
    NODE_ENV: '"production"',
  },
  terser: {
    enable: true,
    config: {
      // https://github.com/terser/terser#minify-options
      warnings: false,
      compress: {
        drop_debugger: false,
        drop_console: false,
      },
      sourceMap: false,
      cache: true,
      parallel: true,
    },
  },
  csso: {
    enable: true,
    config: {
      // https://github.com/css/csso#minifysource-options
      comments: false,
    },
  },
  mini: {
    miniCssExtractPluginOption: {
      ignoreOrder: true
    },
    addChunkPages(pages) {
      const indexPages = miniConfig.subPackages[0].pages;
      const subPages = miniConfig.subPackages[1].pages;
      const userPages = miniConfig.subPackages[2].pages;
      indexPages.map(page => {
        pages.set(`indexPages/${page}`, ['indexPages/common']);
      });
      subPages.map(page => {
        pages.set(`subPages/${page}`, ['subPages/common']);
      });
      userPages.map(page => {
        pages.set(`userPages/${page}`, ['userPages/common']);
      });
    },
    webpackChain(chain, webpack) {
      // chain.plugin('analyzer').use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, []);
      const defaultDefinePlugin = getDefinePlugin();
      chain.plugin()
        .use(webpack.DefinePlugin, [{
          ...defaultDefinePlugin
        }]);
      getDZQPluginLoader(chain);

      chain.merge({
        optimization: {
          splitChunks: {
            cacheGroups: {
              indexPagesCommon: {
                name: 'indexPages/common',
                minChunks: 2,
                reuseExistingChunk: true,
                test: (module, chunks) => {
                  const isNoOnlySubpackRequired = chunks.find(chunk => !(/\bindexPages\b/.test(chunk.name) || /\bsubPages\b/.test(chunk.name) || /\buserPages\b/.test(chunk.name)))
                  return !isNoOnlySubpackRequired
                },
                priority: 500
              },
              subPagesCommon: {
                name: 'subPages/common',
                minChunks: 2,
                reuseExistingChunk: true,
                test: (module, chunks) => {
                  const isNoOnlySubpackRequired = chunks.find(chunk => !(/\bsubPages\b/.test(chunk.name) || /\bindexPages\b/.test(chunk.name) || /\buserPages\b/.test(chunk.name)))
                  return !isNoOnlySubpackRequired
                },
                priority: 1
              },
              userPagesCommon: {
                name: 'userPages/common',
                minChunks: 2,
                reuseExistingChunk: true,
                test: (module, chunks) => {
                  const isNoOnlySubpackRequired = chunks.find(chunk => !(/\bsubPages\b/.test(chunk.name) || /\bindexPages\b/.test(chunk.name) || /\buserPages\b/.test(chunk.name)))
                  return !isNoOnlySubpackRequired
                },
                priority: 1
              },
              vendors: {
                name: 'vendors',
                minChunks: 2,
                reuseExistingChunk: true,
                test: (module, chunks) => {
                  return /[\\/]node_modules[\\/]/.test(module.resource);
                },
                priority: 200,
              },
              taro: {
                name: 'taro',
                test: module => {
                  return /@tarojs[\\/][a-z]+/.test(module.context);
                },
                priority: 300,
              },
              discuzq: {
                name: 'discuzq',
                test: module => {
                  return /@discuzqsdk[\\/][a-z]+/.test(module.context);
                },
                priority: 900,
              },
            }
          }
        }
      })
    }
    // TODO: 小程序的分包打包的优化
    // 分包优化的打包需要结合 webpackChain 和 addChunkPages
    // 具体请看：https://taro-docs.jd.com/taro/docs/next/taro-in-miniapp/#%E5%AF%B9-taro-%E9%A1%B9%E7%9B%AE%E7%9A%84%E9%83%A8%E5%88%86%E9%A1%B5%E9%9D%A2%E5%88%86%E5%8C%85
    // webpackChain(chain, webpack) {
    //   chain.plugin()
    //   .use(webpack.DefinePlugin, [
    //     {
    //       'process.env.DISCUZ_ENV': JSON.stringify('mini')
    //     }
    // ]);
    //   chain.merge({
    //     // 可以进行打包优化分包
    //     optimization: {
    //       runtimeChunk: {
    //         name: 'runtime',
    //       },
    //       splitChunks: {
    //         chunks: 'all',
    //         maxInitialRequests: Infinity,
    //         minSize: 0,
    //         cacheGroups: {
    //           common: {
    //             name: 'common',
    //             minChunks: 2,
    //             priority: 1,
    //           },
    //           vendors: {
    //             name: 'vendors',
    //             minChunks: 2,
    //             test: module => {
    //               return /[\\/]node_modules[\\/]/.test(module.resource);
    //             },
    //             priority: 10,
    //           },
    //           taro: {
    //             name: 'taro',
    //             test: module => {
    //               return /@tarojs[\\/][a-z]+/.test(module.context);
    //             },
    //             priority: 100,
    //           },
    //         },
    //       },
    //     },
    //   });
    // },
    // commonChunks: ['runtime', 'vendors', 'taro', 'common'],
  },
  h5: {
    /**
     * 如果h5端编译后体积过大，可以使用webpack-bundle-analyzer插件对打包体积进行分析。
     * 参考代码如下：
     * webpackChain (chain) {
     *   chain.plugin('analyzer')
     *     .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [])
     * }
     */
  },
};
