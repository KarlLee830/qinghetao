import React, { useCallback, useMemo } from 'react';
import Avatar from '@components/avatar';
import { Button, Icon } from '@discuzqsdk/design';
import MemberBadge from '@components/member-badge';
import classnames from 'classnames';

import styles from './index.module.scss';

/**
 * 活跃用户
 * @prop {{id:string, image:string, name: string}[]} data 用户数据
 * @prop {function} onItemClick 用户点击事件
 */
const ActiveUsers = ({ data, onItemClick, onFollow, userId, noOperation = false }) => (
  <div className={styles.list}>
    {data?.map((item, index) => (
      <User
        key={index}
        data={item}
        onFollow={onFollow}
        onClick={onItemClick}
        userId={userId}
        noOperation={noOperation}
      />
    ))}
  </div>
);

/**
 * 用户组件
 * @prop {object} data 用户数据
 * @prop {function} onClick 用户点击事件
 */
const User = ({ data, onClick, onFollow, userId, noOperation }) => {
  const click = useCallback((e) => {
    e && e.stopPropagation();

    const avatarPopup = e?.currentTarget.querySelector("#avatar-popup");
    if( e && avatarPopup && avatarPopup.contains(e.target)) { // 处理来源于Avatar弹框的点击
      return;
    }

    onClick && onClick(data);
  }, [data, onClick]);

  const handleFollow = (e) => {
    e && e.stopPropagation();

    const type = btnInfo.text === '关注' ? '1' : '0'
    onFollow({ id: data.userId, type })
  }

  const btnInfo = useMemo(() => {
    if (data.isMutualFollow) {
      return { text: '互关', icon: 'WithdrawOutlined', className: styles.withdraw }
    }
    if (data.isFollow) {
      return { text: '已关注', icon: 'CheckOutlined', className: styles.isFollow }
    }
    return { text: '关注', icon: 'PlusOutlined', className: styles.follow }
  }, [data.isFollow, data.isMutualFollow])

  return (
    <div className={styles.item} onClick={click}>
      <div>
        <Avatar image={data.avatar} name={data.nickname} isShowUserInfo userId={data.userId} />
      </div>
      <div className={styles.content}>
        <div className={classnames(styles.top, data.level && styles.memberUser)}>
          <span className={styles.name}>{data.nickname}</span>
          {
            data.level ? 
              <MemberBadge
                groupLevel={data.level}
                groupName={data.groupName}
              />
            :
            <span className={styles.group}>{data.groupName}</span>
          }
        </div>
        <div className={styles.num}>
          <div className={styles.numItem}>
            <span className={styles.numTitle}>主题</span>
            {data.threadCount}
          </div>
          {/* <div className={styles.numItem}>
            <span className={styles.numTitle}>问答</span>
            {data.questionCount}
          </div> */}
          <div className={styles.numItem}>
            <span className={styles.numTitle}>点赞</span>
            {data.likedCount}
          </div>
          <div className={styles.numItem}>
            <span className={styles.numTitle}>关注</span>
            {data.followCount}
          </div>
        </div>
      </div>
      {!noOperation && data?.userId !== userId && <Button type="primary" className={`${styles.button} ${btnInfo.className}`} onClick={handleFollow}>
        {
          btnInfo.text === '关注' ?
          <span className={styles.addText}>+</span>
          : 
          <Icon name={btnInfo.icon} size={10} className={styles.addIcon} />
        }
        {btnInfo.text}
      </Button>}
    </div>
  );
};

export default React.memo(ActiveUsers);
