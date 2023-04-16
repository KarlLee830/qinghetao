import React, { useCallback } from 'react';
import Avatar from '@components/avatar';
import SiteMapLink from '@components/site-map-link';
import styles from './index.module.scss';

/**
 * 活跃用户
 * @prop {{id:string, image:string, name: string}[]} data 用户数据
 * @prop {function} onItemClick 用户点击事件
 */
const ActiveUsers = ({ data, onItemClick }) => {

  const newData = data.filter((_, index) => index < 10);

  const click = (data) => {
    typeof onItemClick === 'function' && onItemClick(data);
  };

  return (
  <div className={styles.list}>
    {newData.length > 0
      && Array(Math.ceil(newData.length / 5))
        .fill('')
        .map((v, rowIndex, rowArr) => (
          <div key={rowIndex} className={`${styles.itemRow} ${rowIndex === rowArr.length - 1 ? styles.lastRow : ''}`}>
            {Array(5)
              .fill('')
              .map((v, index) => {
                const prevIndex = rowIndex * 5;
                const user = newData[index + prevIndex];
                if (!user) return null;
                return (
                  <div key={index} className={styles.item} onClick={() => click(user)}>
                    <SiteMapLink href={`/user/${user.userId}`} text={user.nickname}/>
                    <Avatar className={styles.avatarImg} image={user.avatar} name={user.nickname} />
                    <div className={styles.name}>{user.nickname || ''}</div>
                  </div>
                );
              })}
          </div>
        ))}
  </div>
  );
};

export default React.memo(ActiveUsers);
