/**
 * 消息模块常量
 */

// 全局未读消息轮询间隔时间(毫秒)
export const unreadUpdateInterval = 60000;


// 侧边栏常量
export const sidebarData = [
  {
    iconName: 'MyPrivateLetterOutlined',
    iconColor: '#7BA5F9',
    content: '我的私信',
    type: 'index',
    unreadKeyName: 'dialogMessageUnread',
    unreadCount: 0,
  },
  {
    iconName: 'RemindOutlined',
    iconColor: '#3AC15F',
    content: '账号消息',
    type: 'account',
    unreadKeyName: 'accountUnread',
    unreadCount: 0,
  },
  {
    iconName: 'RenminbiOutlined',
    iconColor: '#FFC300',
    content: '财务通知',
    type: 'financial',
    unreadKeyName: 'financialUnread',
    unreadCount: 0,
  },
  {
    iconName: 'LeaveWordOutlined',
    iconColor: '#E02433',
    content: '帖子通知',
    type: 'thread',
    unreadKeyName: 'threadUnread',
    unreadCount: 0,
  },
];