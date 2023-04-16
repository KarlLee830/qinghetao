/**
 * 站点配置的一些变量
 * 包括 ../config 下面的基础配置
 */
import initEnvConfig from '@common/config';
// 环境配置
export const ENV_CONFIG = initEnvConfig();

// 应用主题
export const APP_THEME = {
  light: 'light',
  dark: 'dark',
};

export const ERROR_PAGE_TIPS = {
  site: '获取站点接口信息失败',
  apply: '出bug了 页面暂时无法展示'
}

export const IMG_SRC_HOST = ENV_CONFIG.COMMON_BASE_URL;

/**
 * 后端错误码
**/

export const JUMP_TO_LOGIN = -3001; // 到登录页
export const JUMP_TO_REGISTER = -3002; // 到注册页
export const JUMP_TO_AUDIT = -3003; // 到注册审核页
export const JUMP_TO_REFUSE = -4007; // 到审核拒绝页
export const JUMP_TO_DISABLED = -4009; // 到审核禁用页
export const JUMP_TO_HOME_INDEX = -3004; // 到首页
export const SITE_CLOSED = -3005; // 站点关闭
export const JUMP_TO_PAY_SITE = -3006; // 到付费加入页面
export const JUMP_TO_SUPPLEMENTARY = -3007; // 跳转到扩展字段页
export const INVALID_TOKEN =  -4002;// 无权限
export const TOKEN_FAIL =  -4011;// token失效
export const JUMP_TO_404 = -4004; // 资源不存在
export const NEED_BIND_WEIXIN_FLAG = -8000; // 需要绑定微信
export const NEED_BIND_PHONE_FLAG = -8001; // 需要绑定手机
export const SITE_NO_INSTALL = -10001; // 站点未安装
export const OPERATING_FREQUENCY = -5002; // 操作频繁

// web端站点加入路由白名单
export const WEB_SITE_JOIN_WHITE_LIST = [
  '/user/agreement', // 网站协议
  '/user/login', // 登录中转
  '/user/wx-auth', // 登录中转
  '/user/phone-login', // 手机登录
  '/user/username-login', // 用户名登录
  '/user/wx-login', // 微信登录
  '/user/wx-authorization', // 微信授权
  '/user/wx-bind', // 微信绑定
  '/user/wx-bind-phone', // 微信绑定手机号
  '/user/wx-bind-qrcode', // 扫码绑定微信
  '/user/wx-bind-username', // 微信用户名绑定
  '/user/wx-select', // 微信落地页
  '/user/register', // 注册
  '/user/status', // 状态
  '/user/supplementary', // 补充信息
  '/user/reset-password', // 找回密码
  '/user/agreement', // 协议
  '/user/bind-phone', // 绑定手机号
  '/user/bind-nickname', // 绑定昵称
  '/user/rebind', // 微信换绑
  '/user/wx-rebind-action', // 换绑授权
  '/my', // 个人中心
  '/forum/partner-invite', // 站点加入
  '/wallet', // 钱包充值
  '/wallet/recharge', // 充值界面
];

// mini端站点加入路由白名单
export const MINI_SITE_JOIN_WHITE_LIST = [
  '/pages/index/index', // 小程序进入页
  '/userPages/user/wx-auth/index', // 快捷登录
  '/userPages/user/wx-select/index', // 微信落地页
  '/userPages/user/bind-phone/index', // 绑定手机号
  '/userPages/user/bind-nickname/index', // 设置昵称
  '/userPages/user/status/index', // 状态
  '/userPages/user/wx-bind/index', // 小程序绑定
  '/userPages/user/wx-authorization/index', // 微信授权
  '/userPages/user/wx-bind-username/index', // 用户名绑定
  '/userPages/user/wx-bind-phone/index', // 绑定手机号
  '/userPages/my/edit/find/paypwd/index', // 忘记密码
  '/userPages/user/supplementary/index', // 补充信息
  '/userPages/user/rebind/index', // 微信换绑
  '/userPages/user/wx-rebind-action/index', // 换绑授权
  '/userPages/my/index', // 个人中心
  '/subPages/forum/partner-invite/index', // 站点加入
  '/userPages/my/edit/paypwd/index', // 设置支付密码
  '/subPages/wallet/recharge/index', // 充值界面
];

// mini端站点，用户账号审核中可以访问的路由白名单
export const REVIEWING_USER_WHITE_LIST = [
  '/pages/index/index', // 启动页
  '/indexPages/home/index', // 首页
  '/subPages/thread/index', // 帖子详情页
  '/userPages/user/status/index', // 用户状态提示页
  '/subPages/forum/partner-invite/index', // 站点加入
  '/userPages/user/supplementary/index', // 补充信息
  '/userPages/user/bind-phone/index', // 绑定手机号
];

// web端站点，用户账号审核中可以访问的路由白名单
export const REVIEWING_USER_WHITE_LIST_WEB = [
  '/', // 首页
  '/user/status', // 用户状态提示页
  '/forum/partner-invite', // 站点加入
  '/user/bind-nickname', // 绑定昵称
  '/user/supplementary', // 补充信息
  '/user/bind-phone', // 绑定手机号
  '/user/bind-nickname', // 绑定昵称
];

export const PERMISSION_PLATE = [
  {
    type: 'thread.insertImage',
    value: '插入图片'
  },
  {
    type: 'thread.insertVideo',
    value: '插入视频'
  },
  {
    type: 'thread.insertAudio',
    value: '插入语音'
  },
  {
    type: 'thread.insertAttachment',
    value: '插入附件'
  },
  {
    type: 'thread.insertGoods',
    value: '插入商品'
  },
  {
    type: 'thread.insertPay',
    value: '插入付费'
  },
  {
    type: 'thread.insertReward',
    value: '插入悬赏'
  },
  {
    type: 'thread.insertRedPacket',
    value: '插入红包'
  },
  {
    type: 'thread.insertPosition',
    value: '插入位置'
  },
  {
    type: 'thread.allowAnonymous',
    value: '允许匿名'
  },
  {
    type: 'thread.viewThreads',
    value: '查看主题列表'
  },
  {
    type: 'thread.viewPosts',
    value: '查看主题详情'
  },
  {
    type: 'thread.freeViewPosts',
    value: '免费查看付费内容'
  },
  {
    type: 'thread.reply',
    value: '回复主题'
  },
  {
    type: 'thread.essence',
    value: '加精'
  },
  {
    type: 'thread.poster',
    value: '海报'
  },
  {
    type: 'thread.edit',
    value: '编辑主题'
  },
  {
    type: 'thread.hide',
    value: '删除主题'
  },
  {
    type: 'thread.hidePosts',
    value: '删除回复'
  },
  {
    type: 'thread.editOwnThread',
    value: '编辑自己的主题'
  },
  {
    type: 'thread.hideOwnThreadOrPost',
    value: '删除自己的主题或回复'
  },
];

export const COMMON_PERMISSION = [
  {
    type: 'thread.sticky',
    value: '置顶'
  },
  {
    type: 'thread.favorite',
    value: '收藏帖子'
  },
  {
    type: 'thread.likePosts',
    value: '点赞帖子'
  },
  {
    type: 'user.view',
    value: '查看用户信息'
  },
  {
    type: 'userFollow.create',
    value: '关注/取关用户'
  },
  {
    type: 'dialog.create',
    value: '发布私信'
  },
  {
    type: 'other.canInviteUserScale',
    value: '裂变推广(邀请加入)'
  },
  {
    type: 'createThreadWithCaptcha',
    value: '发布帖子时需要验证码'
  },
  {
    type: 'publishNeedBindPhone',
    value: '发布帖子时需要绑定手机'
  },
  {
    type: 'cash.create',
    value: '申请提现'
  },
  {
    type: 'order.create',
    value: '创建订单'
  },
  {
    type: 'trade.pay.order',
    value: '支付订单'
  },
];
