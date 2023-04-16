/**
 * mini - 消息通知item组件 type:私信-chat,帖子-thread,财务-financial,账号-account
*/
import React, { Component } from 'react';
import Taro from '@tarojs/taro';
import { View, Navigator } from '@tarojs/components';
import RichText from '@discuzqsdk/design/dist/components/rich-text/index';
import Avatar from '@components/avatar';
import UnreadRedDot from '@components/unread-red-dot';
import { inject, observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './index.module.scss';

import { diffDate } from '@common/utils/diff-date';
import { handleLink } from '@components/thread/utils';
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';
import PropTypes from 'prop-types';
import defaultFavicon from '../../../public/dzq-img/default-favicon.png';

@inject('site')
@observer
class Index extends Component {
  // 获取头像地址,非账户消息使用自己的url头像，账户消息使用站点logo
  getAvatar = (avatar) => {
    const { type, site } = this.props;
    const url = site?.webConfig?.setSite?.siteFavicon;
    if (type === 'account') {
      return url || defaultFavicon;
    }
    return avatar;
  }

  // 获取财务消息展示内容
  getFinancialContent = () => {
    const { item, site } = this.props;

    let tips = '';
    switch (item.type) {
      case 'rewarded':
        if (item.orderType === 1) return (<>
          邀请{item.nickname}加入{site?.webConfig?.setSite?.siteName}
        </>);
        if (item.orderType === 3 || item.orderType === 7) {
          tips = '支付了你';
        } else {
          tips = '打赏了你';
        }
        break;
      case 'receiveredpacket':
        tips = '获取红包';
        break;
      case 'threadrewarded':
        tips = '悬赏了你';
        break;
      case 'threadrewardedexpired':
        tips = `悬赏到期，未领取金额${item.amount}元被退回`;
        break;
    }

    return (<>
      在帖子"
      <View
        className={`${styles['financial-content']} ${styles['single-line']}`}
        style={{
          maxWidth: `90px`,
          display: 'inline-block',
          verticalAlign: 'bottom'
        }}
        dangerouslySetInnerHTML={{ __html: this.parseHTML() }}
      />"中{tips}
    </>)
  }

  // 帖子消息前置语
  getThreadTips = (item) => {
    switch (item.type) {
      case 'replied':
        return `回复了你的${item.isFirst ? '主题' : '评论'}`;
      case 'related':
        return `@了你`;
      case 'liked':
        return `点赞了你的${item.isFirst ? '主题' : '评论'}`;
    }
  };

  filterTag(html) {
    return html?.replace(/<(\/)?([beprt]|br|div|h\d)[^>]*>|[\r\n]/gi, '')
      .replace(/<img[^>]+>/gi, $1 => {
        return $1.includes('qq-emotion') ? $1 : "[图片]";
      });
  }

  // parse content
  parseHTML = () => {
    const { type, item } = this.props;
    let _content = (typeof item.content === 'string' && item.content !== 'undefined') ? item.content : '';

    if (type === 'thread') {
      const tip = `<span class=\"${styles.tip}\">${this.getThreadTips(item)}</span>`;
      _content = tip + _content;
    }

    let t = xss(s9e.parseEmoji(this.filterTag(_content)));
    t = (typeof t === 'string') ? t : '';

    return t;
  }

  // 跳转用户中心
  toUserCenter = (e, canJump, item) => {
    e.stopPropagation();
    if (!canJump || !item.nickname || !item.userId || item.isAnonymous) return;
    Taro.navigateTo({ url: `/userPages/user/index?id=${item.userId}` })
  }

  // 跳转主题详情or私信
  toDetailOrChat = (e, item) => {
    let url = "";
    const { type } = this.props;
    if (item.threadId) {
      url = `/indexPages/thread/index?id=${item.threadId}`;
    }
    // 处理点击帖子通知 - 回复(携带评论id, 用于评论定位展示)
    if ((item.type === "replied" || item.type === "related") && item.threadId && item.postId) {
      if (item.isReply) {
        url = `/indexPages/thread/comment/index?id=${item.replyPostId}&threadId=${item.threadId}&postId=${item.postId}&fromMessage=true`;
      } else {
        url = `/indexPages/thread/index?id=${item.threadId}&postId=${item.postId}`;
      }
    }
    if (type === 'chat') {
      url = `/subPages/message/index?page=chat&dialogId=${item.dialogId}&nickname=${item.nickname || ''}`;
    }

    url && Taro.navigateTo({ url });
  }

  handleContentClick = (e, node) => {
    const { url } = handleLink(node)

    if (url) {
      e && e.stopPropagation();
      Taro.navigateTo({ url })
    }
  }

  render() {
    const { type, item = { }, isLast } = this.props;
    const avatarUrl = this.getAvatar(item.avatar);

    return (
      <View className={styles.wrapper} onClick={(e) => this.toDetailOrChat(e, item)}>

        {/* 默认block */}
        <View className={styles.block}>
          {/* 头像 */}
          <View
            className={styles.avatar}
            onClick={(e) => this.toUserCenter(e, type !== 'account', item)}
          >
            <UnreadRedDot type='avatar' unreadCount={item.unreadCount}>
              <Avatar image={avatarUrl} name={item.nickname} />
            </UnreadRedDot>
          </View>
          {/* 详情 */}
          <View className={classNames(styles.detail, {
            [styles['detail-chat']]: type === 'chat',
            [styles['detail-thread']]: type === 'thread',
            [styles['detail-financial']]: type === 'financial',
            [styles['detail-account']]: type === 'account',
            [styles['border-none']]: isLast,
          })}
          >
            {/* 顶部 */}
            <View className={styles.top}>
              <View
                className={classNames(styles.name, {
                  [styles['single-line']]: true,
                })}
                onClick={(e) => this.toUserCenter(e, type !== 'account', item)}
              >
                {item.nickname || this.filterTag(item.title) || "用户已删除"}
              </View>
              {['chat', 'account'].includes(type) &&
                <View className={styles.time}>{diffDate(item.createdAt)}</View>
              }
              {type === 'financial' &&
                <View className={styles.amount}>+{parseFloat(item.amount).toFixed(2)}</View>
              }
            </View>

            {/* 中部 */}
            <View className={classNames(styles.middle)}>
              {/* 财务内容 */}
              {type === 'financial' &&
                <View className={styles['content-html']}>
                  {this.getFinancialContent()}
                </View>
              }
              {/* 私信 */}
              {type === 'chat' &&
                <View
                  className={classNames(styles['content-html'], styles['single-line'])}
                  dangerouslySetInnerHTML={{ __html: this.parseHTML() }}
                />
              }
              {/* 帖子、账户 */}
              {['thread', 'account'].includes(type) &&
                <>
                  <RichText content={this.parseHTML()} onClick={this.handleContentClick} />
                  {/* 付费站点和付费用户组的续费链接 */}
                  {(item.raw?.refeeType) && <Navigator className={styles.url} url="/userPages/my/index">点击续费</Navigator>}
                </>
              }
            </View>

            {/* 底部 */}
            {['financial', 'thread'].includes(type) &&
              <View className={`${styles.bottom} ${styles.time}`}>
                {diffDate(item.createdAt)}
              </View>
            }
          </View>
        </View>
      </View>
    );
  }
}

Index.propTypes = {
  type: PropTypes.string,
  item: PropTypes.object,
}

Index.defaultProps = {
  type: 'account',
  item: { },
}

export default Index;
