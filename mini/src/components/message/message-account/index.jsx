import React, { useEffect } from 'react'
import { inject, observer } from 'mobx-react';
import { View } from '@tarojs/components';
import styles from './index.module.scss';

import Notice from '@components/message/notice';

const Index = ({ message }) => {
  const { accountMsgList, readAccountMsgList, deleteMsg } = message;
  const { list, currentPage, totalPage } = accountMsgList;

  useEffect(() => {
    fetchMessageData(1)
  }, []);

  // 请求数据
  const fetchMessageData = async (initPage = 0) => {
    return await readAccountMsgList(initPage || currentPage + 1);
  }

  return (
    <View className={styles.container}>
      <Notice
        noMore={currentPage >= totalPage}
        list={list}
        type='account'
        onPullDown={() => fetchMessageData(1)}
        onScrollBottom={() => fetchMessageData()}
        onBtnClick={(item) => deleteMsg(item.id, 'accountMsgList')}
      />
    </View>
  )
}

export default inject('message')(observer(Index));
