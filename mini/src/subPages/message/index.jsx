import React, { useEffect } from 'react';
import styles from './index.module.scss';
import Page from '@components/page';
import Message from '@layout/message';
import { getCurrentInstance } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import setTitle from '@common/utils/setTitle';

/**
 * 消息页面当前显示的消息模块
 *
 * 从url query参数中取值page、subPage、dialogId, userId, nickname
 * page=index: 消息首页
 * page=thread: 帖子通知，subPage=at/reply/like为贴子通知下@我的、回复我的、点赞我的3个子页面
 * page=financial: 财务通知
 * page=account: 账号消息
 * page=chat: 聊天对话，dialogId=xxx为当前对话id，username为聊天对方的用户名，nickname为聊天对方的昵称
 *
 */
const Index = () => {
  const { router } = getCurrentInstance();

  // 参数过滤
  const params = (({ page, subPage, dialogId, userId, nickname }) => {
    if (!['index', 'thread', 'financial', 'account', 'chat'].includes(page)) {
      page = 'index';
    }

    if (!['at', 'reply', 'like'].includes(subPage)) {
      subPage = '';
    }

    return { page, subPage, dialogId, userId, nickname };
  })(router.params);

  useEffect(() => {
    Taro.hideHomeButton();
    Taro.hideShareMenu();
    const { page, nickname } = params;
    switch (page) {
      case 'index':
        setTitle('我的消息');
        break;
      case 'thread':
        setTitle('帖子通知');
        break;
      case 'financial':
        setTitle('财务通知');
        break;
      case 'account':
        setTitle('账号消息');
        break;
      case 'chat':
        const name = nickname.substr(0, 6);
        setTitle(nickname ? `与 ${nickname.length > 6 ? `${name}...` : name} 的对话` : '私信对话');
        break;
    }
  });

  return (
    <Page className={styles.page}>
      <Message {...params} />
    </Page>
  );
};

export default Index;
