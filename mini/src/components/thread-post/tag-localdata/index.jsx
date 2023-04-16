/**
 * 提示有本地缓存标签
 */
import React from 'react';
import { Text } from '@tarojs/components';
import Tag from '@discuzqsdk/design/dist/components/tag/index';
import { inject, observer } from 'mobx-react';
import * as localData from '@common/utils/thread-post-localdata';
import classNames from 'classnames';
import styles from './index.module.scss';

const TagLocalData = (props) => {
  const { threadPost, user, className = '', pc, pid } = props;

  const openLocalData = () => {
    const data = localData.getThreadPostDataLocal(user.userInfo.id, pid) || {};
    const text = data.contentText || '';
    threadPost.setLocalDataStatus(false); // 隐藏本地缓存提示
    threadPost.setPostData({
      ...data,
      contentText: text.replace(/<br \/>\n/g, '\n'),
      autoSaveTime: '',
    }); // 设置发帖内容
  };

  const cls = pc ? styles.pc : styles.h5;

  if (threadPost.isHaveLocalData) {
    return (
      <Tag
        className={classNames(className, cls, styles['tag-local-data'])}
        closeable
        onClose={() => {
          threadPost.setLocalDataStatus(false);
        }}
        onClick={openLocalData}
      >有本地缓存
        <Text className={styles['local-open']}>打开</Text>
      </Tag>
    );
  }
  return null;
};

export default inject('threadPost', 'user')(observer(TagLocalData));
