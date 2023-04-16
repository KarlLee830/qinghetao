import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import styles from './index.module.scss';

import Card from '@components/message/message-card';
import Notice from '@components/message/notice';
import BottomNavBar from '@components/bottom-nav-bar';

@inject('site')
@inject('message')
@inject('user')
@observer
export class MessageIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 'chat',
      items: [
        {
          iconName: 'RemindOutlined',
          title: '账号消息',
          link: '/message/?page=account',
          unreadCount: 0,
        },
        {
          iconName: 'RenminbiOutlined',
          title: '财务通知',
          link: '/message/?page=financial',
          unreadCount: 0,
        },
        {
          iconName: 'LeaveWordOutlined',
          title: '帖子通知',
          link: '/message/?page=thread',
          unreadCount: 0,
        },
      ],
    };
  }

  componentDidMount() {
    this.fetchDialogData(1);
    this.updateUnread();
  }

  componentWillReveiceProps() {
    this.updateUnread();
  }

  updateUnread() {
    const { threadUnread, financialUnread, accountUnread } = this.props.message;
    const items = [...this.state.items];
    items[0].unreadCount = accountUnread;
    items[1].unreadCount = financialUnread;
    items[2].unreadCount = threadUnread;
    this.setState({ items });
  }

  fetchDialogData(initPage = 0) {
    const { readDialogList, dialogList: { currentPage } } = this.props.message;
    return readDialogList(initPage || currentPage + 1);
  }

  formatChatDialogList = (data = []) => {
    const newList = [];
    data.forEach((item) => {
      const { id, dialogMessage, sender, recipient, unreadCount } = item;
      let chatPerson = null;
      if (sender?.id === this.props.user.id) {
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

  handleDelete = (item) => {
    const { message } = this.props;
    message.deleteDialog(item.iid);
  };

  // 跳转其它消息类型
  toOtherMessage = (link) => {
    this.props.router.push(link);
  }

  render() {
    const { items } = this.state;
    const { site: { isPC }, message: { dialogList }, rightContent } = this.props;
    const { list, currentPage, totalPage, totalCount } = dialogList;
    const card = <Card cardItems={items} onClick={this.toOtherMessage} />;

    return (
      <div className={`${styles.wrapper} ${!isPC && styles.mobile}`}>
        <Notice
          infoIdx={0}
          totalCount={totalCount}
          withBottomBar={!isPC}
          noMore={currentPage >= totalPage}
          topCard={isPC ? null : card}
          rightContent={isPC ? rightContent : null}
          list={this.formatChatDialogList(list)}
          type='chat'
          onPullDown={() => this.fetchDialogData(1)}
          onScrollBottom={() => this.fetchDialogData()}
          onBtnClick={this.handleDelete}
        />
        {!isPC && <BottomNavBar placeholder={false} curr={'message'} />}
      </div>);
  }
}

export default withRouter(MessageIndex);
