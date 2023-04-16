/**
 * 消息通知item组件 类型:私信-chat,帖子-thread,财务-financial,账号-account
 *
 * 私信内容：默认展示头像、昵称、时间和一行内容
 * 未读私信内容，在头像上展示未读信息条数，超过99条，则显示99+
 * 点击进入消息页面
 *
 * 账号消息（系统通知）
 * 头像默认为Q的头像，昵称默认为“内容通知”
 * 通知类型包括：编辑、举报、指定、精华、删除、注册申请、欢迎词、角色变更
 * 左滑出现删除按钮，点击删除可删除通知内容
 *
 * 财务通知，包括打赏收入、红包收入、悬赏收入、付费收入
 * 内容区显示：用户头像、名称、金额、内容、时间（12px）
 * 注：帖子内容中默认显示标题，如果没有标题则显示内容，长度限制为90px
 *
 * 帖子通知，@、点赞、回复主题、回复评论
 *
 */
import React, { Component } from 'react';
import { Icon } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './index.module.scss';
import Router from '@discuzqsdk/sdk/dist/router';
import Avatar from '@components/avatar';

import { diffDate } from '@common/utils/diff-date';
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';
import PropTypes from 'prop-types';
import UnreadRedDot from '@components/unread-red-dot';

@inject('site')
@observer
class Index extends Component {
  // 获取头像地址,非账号消息使用自己的url头像，账号消息使用站点logo
  getAvatar = (avatar) => {
    const { type, site } = this.props;
    const url = site?.webConfig?.setSite?.siteFavicon;
    if (type === 'account') {
      return url || '/dzq-img/default-favicon.png';
    }
    return avatar;
  };

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
      <span
        className={`${styles['financial-content']} ${styles['single-line']}`}
        style={{
          maxWidth: `${site.isPC ? '400px' : '90px'}`,
          display: 'inline-block',
          verticalAlign: 'bottom',
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

  // parse content 对于需要显示title作为内容的消息，在对应组件内做预处理后统一传入content属性
  parseHTML = () => {
    const { type, item } = this.props;

    let _content = (typeof item.content === 'string' && item.content !== 'undefined') ? item.content : '';

    if (type === 'thread') {
      const tip = `<span class=\"${styles.tip}\">${this.getThreadTips(item)}</span>`;
      _content = tip + _content;
    }

    let t = xss(s9e.parseEmoji(this.filterTag(_content)));
    t = (typeof t === 'string') ? t : '';

    // 付费站点和付费用户组的续费链接
    if (item.raw?.refeeType) {
      t = t + '<a href="/my">点击续费</a>';
    }

    return t;
  };

  // 跳转用户中心
  toUserCenter = (e, canJump, item) => {
    e.stopPropagation();
    if (!canJump || !item.nickname || !item.userId || item.isAnonymous) return;
    Router.push({ url: `/user/${item.userId}` });
  };

  // 跳转主题详情or私信
  toDetailOrChat = (e, item) => {
    if (e.target.nodeName === 'A') return;
    let url = '';
    const { type } = this.props;

    if (item.threadId) {
      url = `/thread/${item.threadId}`;
    }
    // 处理点击帖子通知 - 回复(携带评论id, 用于评论定位展示)
    if ((item.type === "replied" || item.type === "related") && item.threadId && item.postId) {
      if (item.isReply) {
        url = `/thread/comment/${item.replyPostId}?threadId=${item.threadId}&postId=${item.postId}&fromMessage=true`; // 添加一个是否来自消息中心的标识来展示查看原帖按钮
      } else {
        url = `/thread/${item.threadId}?postId=${item.postId}`;
      }
    }
    if (type === 'chat') {
      url = `/message?page=chat&dialogId=${item.dialogId}&nickname=${item.nickname || ''}`
    }

    url && Router.push({ url });
  };

  render() {
    const { type, item = {}, site, onBtnClick, isLast } = this.props;
    const { isPC } = site;
    const avatarUrl = this.getAvatar(item.avatar);

    return (
      <div
        className={classNames(styles.wrapper, isPC && isLast && styles['set-radius'])}
        onClick={(e) => this.toDetailOrChat(e, item)}
      >
        {/* 默认block */}
        <div className={isPC ? styles['block-pc'] : styles.block}>
          {/* 头像 */}
          <div
            className={classNames(styles.avatar, {
              [styles['unset-cursor']]: type === 'account' || !item.nickname || !item.userId
            })}
            onClick={(e) => this.toUserCenter(e, type !== 'account', item)}
          >

            {/* 未读消息红点 */}
            <UnreadRedDot type='avatar' unreadCount={item.unreadCount}>
              <Avatar
                isShowUserInfo={isPC && item.nickname && type !== 'account'}
                userId={!item.isAnonymous && item.userId}
                image={avatarUrl}
                name={item.nickname}
                circle={true}
              />
            </UnreadRedDot>

          </div>
          {/* 详情 */}
          <div
            className={classNames(styles.detail, {
              [styles['detail-pc']]: isPC,
              [styles['detail-chat']]: type === 'chat',
              [styles['detail-thread']]: type === 'thread',
              [styles['detail-financial']]: type === 'financial',
              [styles['detail-account']]: type === 'account',
              [styles['border-none']]: isLast,
            })}
          >
            {/* 顶部 */}
            <div className={styles.top}>
              <div
                className={classNames(styles.name, {
                  [styles['single-line']]: true,
                  [styles['unset-cursor']]: type === 'account' || !item.nickname || !item.userId
                })}
                onClick={(e) => this.toUserCenter(e, type !== 'account', item)}
              >
                {/* 仅账号消息没有nickname，使用title代替显示 */}
                {item.nickname || this.filterTag(item.title) || "用户已删除"}
              </div>
              {['chat', 'account'].includes(type) && (
                <div className={styles.time}>{diffDate(item.createdAt)}</div>
              )}
              {type === 'financial' && <div className={styles.amount}>+{parseFloat(item.amount).toFixed(2)}</div>}
            </div>

            {/* 中部 */}
            <div className={classNames(styles.middle)}>
              {/* 财务内容 */}
              {type === 'financial' && (
                <p className={styles['content-html']} style={isPC ? { paddingRight: '20px' } : {}}>
                  {this.getFinancialContent()}
                </p>
              )}
              {/* 私信、帖子、账户 */}
              {['chat', 'thread', 'account'].includes(type) && (
                <p
                  className={classNames(styles['content-html'], {
                    [styles['single-line']]: ['chat'].includes(type),
                    [styles['multiple-line']]: ['thread', 'account'].includes(type),
                  })}
                  style={isPC ? { paddingRight: '20px' } : {}}
                  dangerouslySetInnerHTML={{ __html: this.parseHTML() }}
                />
              )}
              {/* PC删除按钮 */}
              {isPC && (
                <div
                  className={styles.delete}
                  onClick={(e) => {
                    e.stopPropagation();
                    onBtnClick(item);
                  }}
                >
                  <Icon className={styles.icon} name="DeleteOutlined" size={14} />
                </div>
              )}
            </div>

            {/* 底部 */}
            {['financial', 'thread'].includes(type) && (
              <div className={`${styles.bottom} ${styles.time}`}>{diffDate(item.createdAt)}</div>
            )}
          </div>
        </div>

      </div>
    );
  }
}

Index.propTypes = {
  type: PropTypes.string,
  item: PropTypes.object,
  onBtnClick: PropTypes.func,
};

Index.defaultProps = {
  type: 'account',
  item: {},
  onBtnClick: () => { },
};

export default Index;
