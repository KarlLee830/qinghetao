import React from 'react'
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';

import Notice from '../notice';

@inject('site')
@inject('message')
@observer
class Index extends React.Component {
  // 初始化
  async componentDidMount() {
    this.fetchMessageData(1);
  }

  // 请求数据
  fetchMessageData(initPage = 0) {
    const { readAccountMsgList, accountMsgList: { currentPage } } = this.props.message;
    return readAccountMsgList(initPage || currentPage + 1);
  }

  // 处理账号消息删除
  handleDelete = (item) => {
    const { deleteMsg } = this.props.message;
    deleteMsg(item.id, 'accountMsgList')
  }

  render() {
    const { site: { isPC }, message: { accountMsgList }, rightContent } = this.props;
    const { list, currentPage, totalPage, totalCount } = accountMsgList;

    return (
      <div className={`${styles.wrapper} ${!isPC && styles.mobile}`}>
        <Notice
          infoIdx={1}
          totalCount={totalCount}
          noMore={currentPage >= totalPage}
          showHeader={!isPC}
          rightContent={isPC ? rightContent : null}
          list={list}
          type='account'
          onPullDown={() => this.fetchMessageData(1)}
          onScrollBottom={() => this.fetchMessageData()}
          onBtnClick={this.handleDelete}
        />
      </div>
    )
  }
}

export default Index;