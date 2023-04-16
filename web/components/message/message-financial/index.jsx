import React, { useEffect, useMemo } from 'react';
import { inject, observer } from 'mobx-react';

import Notice from '@components/message/notice';

import styles from './index.module.scss';

const Index = ({ site, message, rightContent }) => {
  const { readFinancialMsgList, financialMsgList, deleteMsg } = message;
  const { list, currentPage, totalPage, totalCount } = financialMsgList;

  // 初始化
  useEffect(() => {
    fetchFinancialData(1);
  }, []);

  // 请求数据
  const fetchFinancialData = (initPage = 0) => {
    return readFinancialMsgList(initPage || currentPage + 1);
  };

  // 格式化渲染数据
  const formatFinancialList = (list = []) => {
    const newList = [];
    list.forEach(({
      amount, cashActualAmount, isAnonymous, content, createdAt, id, threadId, threadTitle, type, userAvatar, userId, username, nickname, orderType, threadUserAvatar, threadUserNickname
    }) => {
      let _avatar = userAvatar;
      let _userId = userId;
      let _username = username;
      let _nickname = nickname;
      switch (type) {
        case 'threadrewarded':
          _avatar = threadUserAvatar;
          _username = threadUserNickname;
          _nickname = threadUserNickname;
          break;
        case 'threadrewardedexpired':
          _avatar = '';
          _userId = '';
          _username = '悬赏过期退回';
          _nickname = '悬赏过期退回';
          break;
      }

      newList.push({
        amount: amount || cashActualAmount || 0,
        content: threadTitle || content,
        createdAt,
        id,
        threadId,
        type,
        isAnonymous,
        avatar: _avatar,
        userId: _userId,
        username: _username,
        nickname: _nickname,
        orderType,
      });
    });
    return newList;
  };

  // 监听data变化，处理数据
  const renderList = useMemo(() => {
    return formatFinancialList(list);
  }, [list])

  return (
    <div className={`${styles.wrapper} ${!site.isPC && styles.mobile}`}>
      <Notice
        infoIdx={2}
        totalCount={totalCount}
        noMore={currentPage >= totalPage}
        showHeader={!site.isPC}
        rightContent={site.isPC ? rightContent : null}
        list={renderList}
        type='financial'
        onPullDown={() => readFinancialMsgList(1)}
        onScrollBottom={() => fetchFinancialData()}
        onBtnClick={(item) => deleteMsg(item.id, 'financialMsgList')}
      />
    </div>
  );
};

export default inject('site', 'message')(observer(Index));
