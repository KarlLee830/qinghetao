/* eslint-disable no-param-reassign */
import React, { useState, useEffect, useMemo } from 'react';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCWithLogin from '@middleware/HOCWithLogin';
import H5Page from '@layout/message/h5';
import PCPage from '@layout/message/pc';
import { useRouter } from 'next/router';
import ViewAdapter from '@components/view-adapter';

const Index = () => {
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
  const router = useRouter();
  // 参数过滤
  const params = (({ page, subPage, dialogId, userId, nickname }) => {
    if (!['index', 'thread', 'financial', 'account', 'chat'].includes(page)) {
      page = 'index';
    }

    if (!['at', 'reply', 'like'].includes(subPage)) {
      subPage = '';
    }

    return { page, subPage, dialogId, userId, nickname };
  })(router.query);


  const [title, setTitle] = useState('');

  useEffect(() => {
    const { page, nickname } = params;
    switch (page) {
      case 'index':
        setTitle('我的私信');
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
    <ViewAdapter
      h5={ <H5Page {...params} /> }
      pc={ <PCPage {...params} /> }
      title={title}
    />
  );
};


export default HOCFetchSiteData(HOCWithLogin(Index));
