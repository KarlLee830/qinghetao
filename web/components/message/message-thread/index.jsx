import React from 'react'
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import styles from './index.module.scss';

import Card from '../message-card';
import Notice from '../notice';

@inject('site')
@inject('message')
@observer
class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [
        {
          iconName: 'AtOutlined',
          title: '@我的',
          link: '/message?page=thread&subPage=at',
          totalCount: 0,
        },
        {
          iconName: 'DiscussOutlined',
          title: '回复我的',
          link: '/message?page=thread&subPage=reply',
          totalCount: 0,
        },
        {
          iconName: 'PraiseOutlined',
          title: '点赞我的',
          link: '/message?page=thread&subPage=like',
          totalCount: 0,
        },
      ],
      funcType: 'readThreadMsgList',
      type: 'threadMsgList',
    }
  }

  // 初始化
  async componentDidMount() {
    const { router } = this.props;
    const { subPage } = router.query;
    if (subPage) await this.switchTypeByQuery(subPage);
    await this.fetchMessageData(1);
    !subPage && this.setUnReadCount();
  }

  // 处理路由query切换
  async componentWillReceiveProps(nextProps) {
    if (this.props.subPage === nextProps.subPage) return;
    await this.switchTypeByQuery(nextProps.subPage);
    this.fetchMessageData(1)
  }

  // 转换帖子消息渲染类型
  switchTypeByQuery = async (subPage) => {
    switch (subPage) {
      case 'at':
        await this.setState({
          funcType: 'readAtMsgList',
          type: 'atMsgList'
        });
        break;
      case 'reply':
        await this.setState({
          funcType: 'readReplyMsgList',
          type: 'replyMsgList'
        });
        break;
      case 'like':
        await this.setState({
          funcType: 'readLikeMsgList',
          type: 'likeMsgList'
        });
        break;
      default:
        await this.setState({
          funcType: 'readThreadMsgList',
          type: 'threadMsgList'
        });
    }
  }

  // 请求数据
  fetchMessageData(initPage = 0) {
    const { message } = this.props;
    const { funcType, type } = this.state;
    const { currentPage } = message[type];
    return message[funcType](initPage || currentPage + 1);
  }

  setUnReadCount = () => {
    const { atUnread, replyUnread, likeUnread } = this.props.message;
    const items = [...this.state.items];
    items[0].totalCount = atUnread;
    items[1].totalCount = replyUnread;
    items[2].totalCount = likeUnread;
    this.setState({ items });
  }

  // 处理、过滤数据
  handleRenderList = (data = []) => {
    const list = [];
    data.forEach(item => {
      list.push({
        id: item.id,
        isFirst: item.isFirst, // 标识消息主题来源于主题或评论
        createdAt: item.createdAt,
        threadId: item.threadId,
        isReply: item.isReply === 1, // 是否是楼中楼回复
        postId: item.postId || 0,
        replyPostId: item.replyPostId || 0,
        content: item.postContent, // 产品确认后，不展示标题，修改成展示@内容
        type: item.type,
        avatar: item.userAvatar,
        userId: item.userId,
        username: item.username,
        nickname: item.nickname,
      })
    });

    return list;
  }

  // 跳转其它帖子消息
  toOtherMessage = (link) => {
    this.props.router.push(link);
  }

  // 处理消息删除
  handleDelete = (item) => {
    const { deleteMsg } = this.props.message;
    deleteMsg(item.id, this.state.type)
  }

  render() {
    const { site: { isPC }, message, router, rightContent } = this.props;
    const { type, items } = this.state;
    const { subPage } = router.query;
    const { list, currentPage, totalPage, totalCount } = message[type];
    const renderList = this.handleRenderList(list);
    const card = <Card type={subPage} cardItems={items} onClick={this.toOtherMessage} />;

    return (
      <div className={`${styles.wrapper} ${!isPC && styles.mobile}`}>
        <Notice
          infoIdx={3}
          totalCount={totalCount}
          noMore={currentPage >= totalPage}
          showHeader={!isPC}
          // topCard={(isPC || type === 'threadMsgList') ? card : null}
          topCard={isPC ? card : null}
          rightContent={isPC ? rightContent : null}
          list={renderList}
          type='thread'
          onPullDown={() => this.fetchMessageData(1)}
          onScrollBottom={() => this.fetchMessageData()}
          onBtnClick={this.handleDelete}
        />
      </div>
    )
  }
}

export default withRouter(Index);