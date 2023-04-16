// 基础的工具栏
export const baseToolbar = [
  {
    name: 'bold',
    icon: '<div class="dzq-icon dzq-icon-MakeSthOutlined" style="font-size:16px"></div>',
  },
  {
    name: 'italic',
    icon: '<div class="dzq-icon dzq-icon-BiasOutlined" style="font-size:16px"></div>',
  },
  {
    name: 'strike',
    icon: '<div class="dzq-icon dzq-icon-CentralLineOutlined" style="font-size:16px"></div>',
  },
];

// 编辑器基础的选项配置
export const baseOptions = {
  mode: 'wysiwyg',
  placeholder: '请填写您的发布内容…',
  cache: { enable: false },
  toolbar: [...baseToolbar],
  toolbarConfig: {
    hide: false,
    pin: false,
  },
  outline: {
    enable: false,
  },
  hint: {
    parse: false,
  },
};
