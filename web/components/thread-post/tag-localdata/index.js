/**
 * 提示有本地缓存标签
 */
import React from 'react';
import { Tag } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import * as localData from '@common/utils/thread-post-localdata';
import styles from './index.module.scss';
import classNames from 'classnames';
import { withRouter } from 'next/router';

const TagLocalData = (props) => {
  const { threadPost, user, className = '', pc, router } = props;

  const openLocalData = () => {
    const data = localData.getThreadPostDataLocal(user.userInfo.id, router.query.id) || {};
    const text = data.contentText || '';
    threadPost.setLocalDataStatus(false); // 隐藏本地缓存提示
    threadPost.setPostData({
      ...data,
      contentText: text.replace(/<br \/>\n/g, '<br />'),
      autoSaveTime: '',
      isResetContentText: true,
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
        <span className={styles['local-open']}>打开</span>
      </Tag>
    );
  }
  return null;
};

export default inject('threadPost', 'user')(observer(withRouter(TagLocalData)));
