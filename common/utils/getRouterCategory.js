import isServer from './is-server';

// web 端使用的首页链接参数
export default function getRouterCategory(router, site) {
  const defaultData = {
    categoryids: ['all'], // 这里的逻辑如果更改，记得需要更改下面的计算属性：isCurrentAllCategory
    sequence: 0,
    sort: 1,
    attention: 0,
    types: 'all',
    essence: 0,
  };
  try {
    let { slug } = router.query;
    if (!slug) {
      slug = router?.asPath?.split('/');
      slug.splice(0, 1);
    }
    // eslint-disable-next-line prefer-const
    let [, categoryId, , sequence] = slug;
    const { webConfig } = site || {};
    const { other } = webConfig || {};
    const { threadTab } = other || {}; // 所有:0,1 推荐:2 精华:3 已关注:4
    // sequence 对应请求里面的 scope 字段：列表所属模块域 0:普通 1：推荐 2：付费首页 3：搜索页
    // let sequence = '0';
    if (threadTab === 1 || threadTab === 0) sequence = '0';
    if (threadTab === 2) sequence = '1';
    if (threadTab === 3) defaultData.essence = 1;
    if (threadTab === 4) defaultData.attention = 1;
    if (!categoryId) return { ...defaultData, sequence };
    // 分享链接设置的sequece值大于threadTab管理后台设置的tab选中状态
    if (router?.query?.sequence === '1') sequence = router?.query?.sequence;
    // 路由中带值
    if (categoryId || sequence !== '0') {
      let ids = categoryId.split('_').map((item) => {
        // 判断categoryId是否是数字。可能是all/default
        const id = /^\d+$/.test(item) ? Number(item) : item;

        return id;
      })
        .filter(item => item);

      // 这里没有必要这样处理
      // H5处理方案
      if (sequence === '1' && (!ids?.length || ids.indexOf('all') !== -1) && site.platform === 'h5') {
        ids = ['default'];
      }

      // if (ids.indexOf('default') !== -1 && sequence === '0' && site.platform === 'h5') {
      //   sequence = '1';
      // }

      // PC处理方案
      if (!ids?.length && site.platform === 'pc') {
        ids = ['all'];
      }

      return { ...defaultData, categoryids: ids, sequence };
    }
    // 路由中不带值，从store中获取
    return defaultData;
  } catch (err) {
    return defaultData;
  }
}
