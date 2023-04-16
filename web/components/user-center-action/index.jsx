/* eslint-disable spaced-comment */
import React from 'react';
import { Icon } from '@discuzqsdk/design';
import styles from './index.module.scss';
import Router from '@discuzqsdk/sdk/dist/router';
import { observer, inject } from 'mobx-react';
import UnreadRedDot from '@components/unread-red-dot';
import DZQPluginCenterInjectionPolyfill from '../../utils/DZQPluginCenterInjectionPolyfill';

// 插件引入
/**DZQ->plugin->register<plugin_user@user_extension_action_hook>**/

@inject('user')
@inject('message')
@inject('site')
@observer
class UserCenterAction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      actions: [
        {
          cid: 'message',
          name: '我的消息',
          url: '/message',
          iconName: 'MailOutlined',
          visible: true,
        },
        {
          cid: 'wallet',
          name: '我的钱包',
          url: '/wallet',
          iconName: 'PayOutlined',
          visible: true,
        },
        {
          cid: 'collect',
          name: '我的收藏',
          url: '/my/collect',
          iconName: 'CollectOutlinedBig',
          visible: true,
        },
        {
          cid: 'like',
          name: '我的点赞',
          url: '/my/like',
          iconName: 'LikeOutlined',
          visible: this.props.site.platform === 'pc',
        },
        {
          cid: 'block',
          name: '我的屏蔽',
          url: '/my/block',
          iconName: 'ShieldOutlined',
          visible: true,
        },
        {
          cid: 'buy',
          name: '我的购买',
          url: '/my/buy',
          iconName: 'ShoppingCartOutlined',
          visible: true,
        },
        {
          cid: 'draft',
          name: '我的草稿箱',
          url: '/my/draft',
          iconName: 'RetrieveOutlined',
          visible: true,
        },
        {
          cid: 'forum',
          name: '站点信息',
          url: '/forum',
          iconName: 'NotepadOutlined',
          visible: true,
        },
        {
          cid: 'invite',
          name: '推广邀请',
          url: '/invite',
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

  renderActionItem = (item, totalUnread) => {
    if (item.render) {
      return item.render();
    }
    return (
      <div
        onClick={() => {
          this.handleActionItem(item);
        }}
        className={styles.userCenterActionItem}
        key={item.cid}
      >
        <div className={styles.userCenterActionItemIcon}>
          {item.cid === 'message' ? (
            <UnreadRedDot unreadCount={totalUnread}>
              <Icon name={item.iconName} size={20} />
            </UnreadRedDot>
          ) : (
            <Icon name={item.iconName} size={20} />
          )}
        </div>
        <div className={styles.userCenterActionItemDesc}>{item.name}</div>
      </div>
    );
  };

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
      <div
        className={`${styles.userCenterAction} ${this.props.site.platform === 'pc' ? styles.pc : styles.h5} ${
          actions.length < rowActionCount && styles.userCenterColumnStyle
        }`}
      >
        {this.renderActionItems()}
        <DZQPluginCenterInjectionPolyfill
          className={styles.userCenterPluginActionItem}
          target="plugin_user"
          hookName="user_extension_action_hook"
        />
      </div>
    );
  }
}

export default UserCenterAction;
