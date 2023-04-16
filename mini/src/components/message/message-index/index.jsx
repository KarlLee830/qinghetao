import React, { useEffect, useCallback, useMemo } from 'react'
import Taro from '@tarojs/taro';
import { inject, observer } from 'mobx-react';
import { View } from '@tarojs/components';
import styles from './index.module.scss';
import { useDidShow } from '@tarojs/taro';
import Notice from '@components/message/notice';
import Card from '@components/message/message-card';
import BottomNavBar from '@components/bottom-nav-bar';

const Index = ({ message, user, site }) => {
  const { readDialogList, dialogList, threadUnread, financialUnread, accountUnread, deleteDialog } = message;
  const { currentPage, totalPage, list } = dialogList;
  const { webConfig: { other: { threadOptimize } } } = site;

  // 初始化请求数据
  useDidShow(async () => {
    await readDialogList(1);
  });

  // 更新未读消息
  const items = useMemo(() => {
    return [
      {
        iconName: 'RemindOutlined',
        title: '账号消息',
        link: '/subPages/message/index?page=account',
        totalCount: accountUnread  || 0,
      },
      {
        iconName: 'RenminbiOutlined',
        title: '财务通知',
        link: '/subPages/message/index?page=financial',
        totalCount: financialUnread || 0,
      },
      {
        iconName: 'LeaveWordOutlined',
        title: '帖子通知',
        link: '/subPages/message/index?page=thread',
        totalCount: threadUnread || 0,
      },
    ]
  }, [threadUnread, financialUnread, accountUnread]);

  // 过滤展示数据
  const formatChatDialogList = (data = []) => {
    if (!threadOptimize) {
      return [];
    }

    const newList = [];
    data.forEach((item) => {
      const { id, dialogMessage, sender, recipient, unreadCount } = item;
      let chatPerson = null;
      if (sender?.id === user.id) {
        chatPerson = recipient;
      } else {
        chatPerson = sender;
      }
      newList.push({
        iid: id,
        id: `${id}${dialogMessage?.createdAt}`,
        createdAt: dialogMessage?.createdAt,
        dialogId: dialogMessage?.dialogId,
        content: dialogMessage?.imageUrl ? '[图片]' : dialogMessage?.messageText,
        avatar: chatPerson?.avatar,
        userId: chatPerson?.id,
        nickname: chatPerson?.nickname,
        unreadCount: dialogMessage?.unreadCount,
      });
    });

    return newList;
  };

  // 处理下拉
  const onPullDown = useCallback(() => {
    return readDialogList(1);
  }, [])

  // 处理上拉
  const handleScrollBottom = useCallback(() => {
    return readDialogList(currentPage + 1);
  }, [currentPage])

  // 跳转其它消息类型
  const toOtherMessage = useCallback((url) => {
    Taro.navigateTo({ url });
  }, [])

  return (
    <View className={styles.container}>
      <View className={styles['container__inner']}>
        <Notice
          noMore={currentPage >= totalPage}
          topCard={<Card items={items} onClick={toOtherMessage} />}
          list={formatChatDialogList(list)}
          type='chat'
          onPullDown={onPullDown}
          onScrollBottom={handleScrollBottom}
          onBtnClick={(item) => deleteDialog(item.iid)}
        />
      </View>
      <BottomNavBar fixed={false} curr={'message'} />
    </View>
  )
}

export default inject('message', 'user', 'site')(observer(Index));