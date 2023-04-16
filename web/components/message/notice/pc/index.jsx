import React, { useEffect, useRef } from 'react';
import BaseLayout from '@components/base-layout';
import MessageHeader from './message-header';
import NoticeItem from '@components/message/notice-item';
import styles from './index.module.scss';
import { sidebarData } from '@common/constants/message';

const Index = ({ rightContent, infoIdx, totalCount, list, noMore, topCard = null, onScrollBottom, ...other }) => {
  const contentRef = useRef(null);

  // 兼容PC端大屏，消息数量不够时无法主动触底
  useEffect(() => {
    if ((document.body.clientHeight - 200) > contentRef.current.offsetHeight && list.length > 0 && !noMore) {
      onScrollBottom();
    }
  }, [list.length]);

  return (
    <BaseLayout
      className={"mymessage-page"}
      noMore={noMore}
      right={rightContent}
      onRefresh={onScrollBottom}
      showRefresh={false}
      immediateCheck={false}
      isShowLayoutRefresh={true}
    >
      <div ref={contentRef}>
        <MessageHeader info={sidebarData[infoIdx]} totalCount={totalCount} />
        {topCard}
        {list.map((item, index) => <NoticeItem key={item.id} isLast={list.length === (index + 1)}
          item={item} {...other} />)}
      </div>
    </BaseLayout>
  )
}

export default Index;
