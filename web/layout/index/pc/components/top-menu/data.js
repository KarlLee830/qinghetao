export default [
  {
    label: '所有', // 所有
    type: 'all',
    isActive: true,
  }, {
    label: '精华', // 精华
    type: 'essence',
    isActive: false,
  }, {
    label: '已关注', // 已关注
    type: 'attention',
    isActive: false,
  }, {
    label: '类型',
    type: 'types',
    children: [{
      label: '不限',
      value: '',
      isActive: true,
    }],
  }, {
    label: '排序', // 类型
    type: 'sort',
    isActive: false,
    children: [{
      label: '不限', // 不限
      value: '1',
      isActive: true,
    }, {
      label: '发布时间', // 发布时间
      value: '1',
      isActive: false,
    }, {
      label: '评论时间', // 更新时间
      value: '2',
      isActive: false,
    }, {
      label: '热门内容', // 更新时间
      value: '3',
      isActive: false,
    }],
  },
];
