const pluginsConfig = require('./.pluginConfig');

let mergedConfig = [];

if (pluginsConfig.pages.length > 0) {
  mergedConfig = [pluginsConfig]
}

/**
 * 入口配置文件：https://taro-docs.jd.com/taro/docs/next/tutorial/
 */
const config = {
  // TODO: 分包处理
  // 首页和详情页在主包
  pages: ['pages/index/index'],
  subPackages: [
    {
      root: 'indexPages',
      pages: [
        'home/index',
        'thread/index',
        'thread/comment/index',
        'thread/post/index',
        'thread/selectAt/index',
        'thread/selectTopic/index',
        'thread/selectProduct/index',
        'thread/selectRedpacket/index',
        'thread/selectReward/index',
        'thread/selectPayment/index',
        'thread/voteEditor/index',
      ],
    },
    {
      root: 'subPages',
      pages: [
        '404/index',
        '500/index',
        'no-install/index',
        'close/index',
        'create-card/index',
        'join/index',
        'search/index',
        'search/result-topic/index',
        'search/result-post/index',
        'search/result-user/index',
        'search/result/index',
        'topic/index',
        'topic/topic-detail/index',
        'wallet/index',
        'wallet/frozen/index',
        'wallet/withdrawal/index',
        'wallet/recharge/index',
        'forum/index',
        'forum/partner-invite/index',
        'invite/index',
        'message/index',
      ],
    },
    {
      root: 'userPages',
      pages: [
        'user/index',
        'user/wx-bind/index',
        'user/wx-select/index',
        'user/wx-bind-username/index',
        'user/wx-bind-phone/index',
        'user/status/index',
        'user/bind-phone/index',
        'user/bind-nickname/index',
        'user/wx-auth/index',
        'user/wx-authorization/index',
        'user/supplementary/index',
        'user/reset-password/index',
        'user/rebind/index',
        'user/wx-rebind-action/index',
        'my/index',
        'my/buy/index',
        'my/collect/index',
        'my/like/index',
        'my/edit/index',
        'my/draft/index',
        'my/upgrade/index',
        'my/edit/mobile/index',
        'my/edit/pwd/index',
        'my/edit/paypwd/index',
        'my/edit/reset/paypwd/index',
        'my/edit/find/paypwd/index',
        'my/edit/username/index',
        'my/edit/additional-info/index',
        'my/fans/index',
        'my/follows/index',
        'my/block/index',
        'my/renew/index',
      ],
    },
    ...mergedConfig
  ],
  permission: {
    'scope.userLocation': {
      desc: '小程序将获取您的位置信息',
    },
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTextStyle: 'black',
  },
  preloadRule: {
    'pages/index/index': {
      network: 'all',
      packages: ['indexPages'],
    },
    'indexPages/home/index': {
      network: 'all',
      packages: ['subPages'],
    },
    'indexPages/thread/index': {
      network: 'all',
      packages: ['userPages'],
    },
  }
};

module.exports = config;
