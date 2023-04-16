import React from 'react';
import MessageAccount from '@components/message/message-account';
import MessageIndex from '@components/message/message-index';
import MessageThread from '@components/message/message-thread';
import MessageFinancial from '@components/message/message-financial';
import InstantMessaging from '@components/message/instant-messaging';

const Index = ({ page, subPage, dialogId, userId }) => {
  switch (page) {
    case 'index':
      return <MessageIndex />;
    case 'account':
      return <MessageAccount />;
    case 'thread':
      return <MessageThread subPage={subPage} />;
    case 'financial':
      return <MessageFinancial />;
    case 'chat':
      return <InstantMessaging dialogId={dialogId} userId={userId} />;
  }
};

export default Index;
