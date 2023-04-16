import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import styles from './index.module.scss';
import { inject, observer } from 'mobx-react';
import MessageAccount from '@components/message/message-account';
import MessageIndex from '@components/message/message-index';
import MessageThread from '@components/message/message-thread';
import MessageFinancial from '@components/message/message-financial';
import MessageChat from '@components/message/message-chat';
import Copyright from '@components/copyright';
import Stepper from '../../search/pc/components/stepper';
import { sidebarData as sidebarDataOriginal } from '@common/constants/message';
import UserCenterFollowsPc from '@components/user-center/follows-pc';

const Index = ({ page, subPage, dialogId, userId, message, user, nickname }) => {
  const router = useRouter();

  const { threadUnread, financialUnread, accountUnread, dialogMessageUnread } = message;

  const [sidebarData, setSidebarData] = useState(sidebarDataOriginal);

  const [sidebarIndex, setSidebarIndex] = useState(9999);

  const sidebarClick = (_index, _iconName, item) => {
    router.replace(`/message?page=${item.type}`);
  };

  const rightContent = useCallback(() => {
    return (
      <div className={styles.rightside}>
        <div className={styles['stepper-container']}>
          <Stepper onItemClick={sidebarClick} selectIndex={sidebarIndex} data={sidebarData} />
        </div>
        <UserCenterFollowsPc userId={user.id} showMore={false} withLimit={100000} messageMode={true} style={{
          maxHeight: '425px',
        }} />
        <Copyright />
      </div>
    )
  }, [sidebarIndex, sidebarData])

  const mainContent = useMemo(() => {
    // 处理侧边栏选中状态
    const p = page === 'chat' ? 'index' : page;
    sidebarData.forEach((item, i) => {
      if (item.type === p) {
        setSidebarIndex(i);
      }
    });

    // 处理页面主内容切换
    switch (page) {
      case 'index':
        return <MessageIndex rightContent={rightContent} />;
      case 'account':
        return <MessageAccount rightContent={rightContent} />;
      case 'thread':
        return <MessageThread subPage={subPage} rightContent={rightContent} />;
      case 'financial':
        return <MessageFinancial rightContent={rightContent} />;
      case 'chat':
        return <MessageChat dialogId={dialogId} userId={userId} nickname={nickname} rightContent={rightContent} />;
    }
  }, [page, subPage, dialogId, userId, sidebarIndex, sidebarData]);

  // 更新未读消息到视图中
  useEffect(() => {
    setSidebarData(sidebarData.map((item) => {
      const newItem = { ...item };
      newItem.unreadCount = message[item.unreadKeyName] || 0;
      return newItem;
    }));
  }, [threadUnread, financialUnread, accountUnread, dialogMessageUnread]);

  return mainContent;
};

export default inject('message', 'user')(observer(Index));
