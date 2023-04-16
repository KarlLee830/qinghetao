const path = require('path');

const include = [
  path.resolve(__dirname, '../../common'),
  path.resolve(__dirname, '../node_modules/.plugin')
];


const config = {
  projectName: 'discuz-app-mini',
  date: '2021-2-19',
  // https://taro-docs.jd.com/taro/docs/size
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 2,
    828: 1.81 / 2,
    375: 2 / 1,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  defineConstants: {
    LOCATION_APIKEY: JSON.stringify('FF7BZ-27T3X-C574Z-73YBG-FGAJ2-4CF7I')
  },
  alias: {
    '@components': path.resolve(__dirname, '../src/components'),
    '@layout': path.resolve(__dirname, '../src/layout'),
    '@utils': path.resolve(__dirname, '../src/utils'),
    '@pages': path.resolve(__dirname, '../src/pages'),
    '@config': path.resolve(__dirname, '../src/config'),
    '@styles': path.resolve(__dirname, '../src/styles'),
    // 公共目录
    '@common': path.resolve(__dirname, '../../common'),
    '@server': path.resolve(__dirname, '../../common/server'),
    '@store': path.resolve(__dirname, '../../common/server'),
    '@constants': path.resolve(__dirname, '../src/constants'),
    '@discuzqsdk/design/dist': path.resolve(__dirname, '../node_modules', '@discuzqsdk/design/dist-pure'),
    // '@discuzqsdk/design/dist': path.resolve(__dirname, '../node_modules', '@discuzqsdk/design/dist'),
    '@discuzqsdk/sdk/dist': path.resolve(__dirname, '../node_modules', '@discuzqsdk/sdk/dist-pure'),
    // '@discuzqsdk/sdk/dist': path.resolve(__dirname, '../node_modules', '@discuzqsdk/sdk/dist'),
    'regenerator-runtime': path.resolve(__dirname, '../node_modules', 'regenerator-runtime'),
  },
  copy: {
    patterns: [
    ],
    options: {
    },
  },
  framework: 'react',
  mini: {
    compile: {
      include: include,
    },
    baseLevel: 20,
    postcss: {
      autoprefixer: {
        enable: false,
      },
      pxtransform: {
        enable: true,
        config: {

        },
      },
      url: {
        enable: true,
        config: {
          limit: 1024 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {
        },
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
  },
};

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'));
  }
  return merge({}, config, require('./prod'));
};
