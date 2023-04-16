/* eslint-disable spaced-comment */
import React from 'react';
import { observer, inject } from 'mobx-react';
import { View } from '@tarojs/components';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Badge from '@discuzqsdk/design/dist/components/badge/index';
import styles from './index.module.scss';
import Router from '@discuzqsdk/sdk/dist/router';
import UnreadRedDot from '@components/unread-red-dot';
import DZQPluginCenterInjection from '@discuzqsdk/plugin-center/dist/components/DZQPluginCenterInjection';

// 插件引入
/**DZQ->plugin->register<plugin_user@user_extension_action_hook>**/

@inject('user')
@inject('site')
@inject('message')
@observer
class UserCenterAction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      actions: [
        {
          cid: 'message',
          name: '我的消息',
          url: '/subPages/message/index',
          iconName: 'MailOutlined',
          visible: true,
        },
        {
          cid: 'wallet',
          name: '我的钱包',
          url: '/subPages/wallet/index',
          iconName: 'PayOutlined',
          visible: true,
        },
        {
          cid: 'collect',
          name: '我的收藏',
          url: '/userPages/my/collect/index',
          iconName: 'CollectOutlinedBig',
          visible: true,
        },
        {
          cid: 'block',
          name: '我的屏蔽',
          url: '/userPages/my/block/index',
          iconName: 'ShieldOutlined',
          visible: true,
        },
        {
          cid: 'buy',
          name: '我的购买',
          url: '/userPages/my/buy/index',
          iconName: 'ShoppingCartOutlined',
          visible: this.props.site.webConfig?.other?.threadOptimize,
        },
        {
          cid: 'draft',
          name: '我的草稿箱',
          url: '/userPages/my/draft/index',
          iconName: 'RetrieveOutlined',
          visible: true,
        },
        {
          cid: 'forum',
          name: '站点信息',
          url: '/subPages/forum/index',
          iconName: 'NotepadOutlined',
          visible: true,
        },
        {
          cid: 'invite',
          name: '推广邀请',
          url: '/subPages/invite/index',
          iconName: 'NotbookOutlined',
          visible: true,
        },
      ],
      rowActionCount: this.props.site.platform === 'pc' ? 9 : 4,
    };
  }

  handleActionItem = (item) => {
    if (item.onClick && typeof item.onClick === 'function') {
      item.onClick(item);
      return;
    }

    item.url && Router.push({ url: item.url });
  };

  componentDidMount() {
    this.props.message.readUnreadCount();
  }

  renderActionItem = (item, totalUnread) => (
    <View
      onClick={() => {
        this.handleActionItem(item);
      }}
      className={styles.userCenterActionItem}
    >
      <View className={styles.userCenterActionItemIcon}>
        {item.cid === 'message' ? (
          <UnreadRedDot unreadCount={totalUnread}>
            <Icon name={item.iconName} color="#4F5A70" size={20} />
          </UnreadRedDot>
        ) : (
          <Icon name={item.iconName} color="#4F5A70" size={20} />
        )}
      </View>
      <View className={styles.userCenterActionItemDesc}>{item.name}</View>
    </View>
  );

  renderActionItems = () => {
    const { totalUnread } = this.props.message;
    const { actions } = this.state;
    const itemEles = [];

    actions.map((item) => {
      item.visible && itemEles.push(this.renderActionItem(item, totalUnread));
    });

    return itemEles;
  };

  render() {
    const { actions, rowActionCount } = this.state;
    return (
      <View className={`${styles.userCenterAction} ${actions.length < rowActionCount && styles.userCenterColumnStyle}`}>
        {this.renderActionItems()}
        <DZQPluginCenterInjection
          className={styles.userCenterPluginActionItem}
          target="plugin_user"
          hookName="user_extension_action_hook"
        />
      </View>
    );
  }
}

export default UserCenterAction;
