import React, { useCallback, useState } from 'react';
import { inject, observer } from 'mobx-react';
import Avatar from '@components/avatar';
import { Button, Toast } from '@discuzqsdk/design';
import styles from './index.module.scss';

/**
 * 活跃用户
 * @prop {{id:string, image:string, name: string}[]} data 用户数据
 * @prop {function} onItemClick 用户点击事件
 */
const ShieldList = ({ data = [], onItemClick, user }) => (
  <div className={styles.list}>
    {data?.map((item, index) => (
      <User key={index} data={item} onClick={onItemClick} user={user} />
    ))}
  </div>
);

/**
 * 用户组件
 * @prop {object} data 用户数据
 * @prop {function} onClick 解除屏蔽点击事件
 */
const User = ({ data, onClick, user }) => {
  const { undenyUser, denyUser } = user || {};
  // 是否被禁用的 state
  const [blockState, setBlockState] = useState(true);

  const click = useCallback(() => {
    onClick && onClick(data);
  }, [data, onClick]);

  const handleBlockUser = useCallback(
    async (e) => {
      e.stopPropagation();
      const { pid } = data;
      try {
        await denyUser(pid);
        setBlockState(true);
      } catch (e) {
        console.log(e);
        if (e.Code) {
          Toast.error({
            content: e.Msg,
            duration: 1000,
          });
        }
      }
    },
    [data],
  );

  const handleUnBlockUser = useCallback(
    async (e) => {
      e.stopPropagation();
      const { pid } = data;
      try {
        await undenyUser(pid);
        setBlockState(false);
      } catch (e) {
        console.log(e);
        if (e.Code) {
          Toast.error({
            content: e.Msg,
            duration: 1000,
          });
        }
      }
    },
    [data],
  );

  return (
    <div className={styles.item} onClick={click}>
      <div className={styles.avatar}>
        <Avatar image={data.avatar} name={data.nickname} isShowUserInfo userId={data.pid} />
      </div>
      <div className={styles.content}>
        <div className={styles.name}>{data.nickname || ''}</div>
        {blockState ? (
          <Button className={styles.unBlockButton} onClick={handleUnBlockUser}>
            解除屏蔽
          </Button>
        ) : (
          <Button type="primary" className={styles.blockButton} onClick={handleBlockUser}>
            屏蔽
          </Button>
        )}
      </div>
    </div>
  );
};

export default inject('user')(observer(ShieldList));
