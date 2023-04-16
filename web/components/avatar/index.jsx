import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { Avatar, Button, Icon, Toast } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import LoadingBox from '@components/loading-box';
import goToLoginPage from '@common/utils/go-to-login-page';
import classNames from 'classnames';
import calcCosImageQuality from '@common/utils/calc-cos-image-quality';
import styles from './index.module.scss';
import { createPopper } from '@popperjs/core';

function avatar(props) {
  const {
    direction = 'right',
    image = '',
    name = '匿',
    onClick = () => { },
    className = '',
    wrapClassName = '',
    circle = true,
    size = 'primary',
    isShowUserInfo = false,
    userId = null,
    user: myself,
    search,
    userType = -1,
    unifyOnClick = null, // 付费加入，统一点击事件
    withStopPropagation = false, // 是否需要阻止冒泡 默认false不阻止
    level = 6,
    platform = 'pc',
  } = props;

  const currAvatarImage = useMemo(() => {
    if (!image || image === '') return image;
    if (/(http|https):\/\/.*?(gif)/.test(image)) {
      return calcCosImageQuality(image, 'gif');
    } else {
      return calcCosImageQuality(image, 'png', level);
    }
  }, [image, level]);

  const userName = useMemo(() => {
    const newName = (name || '').toLocaleUpperCase()[0];
    return newName;
  }, [name]);

  const [isShow, changeIsShow] = useState(false);
  const [userInfo, changeUserInfo] = useState('padding');
  const [following, changeFollowStatus] = useState(false);
  const [blocking, changeBlockStatus] = useState(false);
  const [isSameWithMe, changeIsSameWithMe] = useState(false);
  let timeout;

  useEffect(() => {
    changeIsSameWithMe(myself?.id === userId);
  }, []);

  const onMouseEnterHandler = useCallback(async () => {
    if (!isShowUserInfo || !userId) return;
    timeout && clearTimeout(timeout);
    changeIsShow(true);

    if (!userInfo || userInfo === 'padding') {
      const userInfo = await myself.getAssignUserInfo(userId);
      changeUserInfo(userInfo);
    }
  });

  const onMouseLeaveHandler = useCallback(() => {
    if (!isShowUserInfo || !userId) return;
    timeout = setTimeout(() => {
      changeIsShow(false);
      changeUserInfo('padding');
    }, 200);
  });

  const followHandler = useCallback(
    async (e) => {
      if (typeof unifyOnClick === 'function') {
        unifyOnClick();
        return;
      }
      e && e.stopPropagation();

      // 对没有登录的先登录
      if (!myself.isLogin()) {
        Toast.info({ content: '请先登录!' });
        goToLoginPage({ url: '/user/login' });
        return;
      }

      changeFollowStatus(true);
      if (userInfo.follow === 0) {
        const res = await myself.postFollow(userId);
        if (res.success) {
          const { isMutual = 0 } = res;
          userInfo.follow = isMutual ? 2 : 1;
          userInfo.fansCount = userInfo.fansCount + 1;
          search?.updateActiveUserInfo(userId, { isFollow: true, isMutual: !!isMutual });
        } else {
          Toast.info({ content: res.msg });
        }
      } else {
        const res = await myself.cancelFollow({ id: userId, type: 1 });
        if (res.success) {
          userInfo.follow = 0;
          userInfo.fansCount = userInfo.fansCount - 1;
          search?.updateActiveUserInfo(userId, { isFollow: false, isMutual: false });
        } else {
          Toast.info({ content: res.msg });
        }
      }
      changeFollowStatus(false);
      changeUserInfo({ ...userInfo });
    },
    [userInfo],
  );

  const messagingHandler = useCallback((e) => {
    if (typeof unifyOnClick === 'function') {
      unifyOnClick();
      return;
    }
    e && e.stopPropagation();

    // 对没有登录的先登录
    if (!myself.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    const { id, nickname } = userInfo;
    if (id) {
      props.router.push(`/message?page=chat&userId=${id}&nickname=${nickname}`);
    } else {
      console.error('用户名错误');
    }
  });

  const blockingHandler = useCallback(
    async (e) => {
      if (typeof unifyOnClick === 'function') {
        unifyOnClick();
        return;
      }
      e && e.stopPropagation();
      // 对没有登录的先登录
      if (!myself.isLogin()) {
        Toast.info({ content: '请先登录!' });
        goToLoginPage({ url: '/user/login' });
        return;
      }

      changeBlockStatus(true);
      try {
        if (userInfo.isDeny) {
          await myself.undenyUser(userId);
          await myself.setTargetUserNotBeDenied({ userId });
          userInfo.isDeny = false;
          Toast.success({
            content: '解除屏蔽成功',
            hasMask: false,
            duration: 1000,
          });
        } else {
          await myself.denyUser(userId);
          await myself.setTargetUserDenied({ userId });
          userInfo.isDeny = true;
          Toast.success({
            content: '屏蔽成功',
            hasMask: false,
            duration: 1000,
          });
        }
      } catch (error) {
        console.error(error);
      }
      changeBlockStatus(false);
      changeUserInfo({ ...userInfo });
    },
    [userInfo],
  );

  const btnInfo = useMemo(() => {
    const index = userInfo.follow;
    if (index === 2) {
      return { text: '互关', icon: 'WithdrawOutlined', className: styles.withdraw };
    }
    if (index === 1) {
      return { text: '已关注', icon: 'CheckOutlined', className: styles.isFollow };
    }
    return { text: '关注', icon: 'PlusOutlined', className: styles.follow };
  }, [userInfo.follow]);

  const clickAvatar = useCallback(
    (e) => {
      if (withStopPropagation) {
        e.stopPropagation();
      }
      if (!userId) return;
      onClick && onClick(e);
    },
    [userId, withStopPropagation],
  );

  const userInfoBox = useMemo(() => {
    if (!isShowUserInfo || !userId) return null;

    if (userInfo === 'padding') {
      return (
        <div className={styles.userInfoBox} style={direction === 'left' ? { right: 0 } : { left: 0 }} onClick={e => e.stopPropagation()}>
          <div className={styles.userInfoContent}>
            <LoadingBox style={{ minHeight: `${isSameWithMe ? '145px' : '205px'}` }} />
          </div>
        </div>
      );
    }

    let targetAvatarImage = userInfo?.avatarUrl;
    if (targetAvatarImage && targetAvatarImage !== '') {
      if (/(http|https):\/\/.*?(gif)/.test(targetAvatarImage)) {
        targetAvatarImage = calcCosImageQuality(targetAvatarImage, 'gif');
      } else {
        targetAvatarImage = calcCosImageQuality(targetAvatarImage, 'png', 5);
      }
    }
    return (
      <div
        id="avatar-popup"
        className={`${styles.userInfoBox} ${direction}`}
        style={direction === 'left' ? { right: 0 } : { left: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className={classNames(styles.userInfoContent, isSameWithMe ? styles.myContent : '')}>
          <div className={styles.header}>
            <div className={styles.left} onClick={clickAvatar}>
              <Avatar
                className={classNames(styles.customAvatar, styles.cursor)}
                circle={true}
                image={targetAvatarImage}
                siz="primary"
                text={userName}
              ></Avatar>
            </div>
            <div className={styles.right}>
              <p className={classNames(styles.name, styles.cursor)} onClick={clickAvatar}>
                {userInfo.nickname}
              </p>
              <p className={styles.text}>
                {userInfo.signature && userInfo.signature !== '' ? userInfo.signature : '暂无签名'}
              </p>
            </div>
          </div>
          <div className={styles.content}>
            <div className={styles.item}>
              <p className={styles.title}>主题</p>
              <p className={styles.text}>{userInfo.threadCount || 0}</p>
            </div>
            <div className={styles.item}>
              <p className={styles.title}>点赞</p>
              <p className={styles.text}>{userInfo.likedCount || 0}</p>
            </div>
            <div className={styles.item}>
              <p className={styles.title}>已关注</p>
              <p className={styles.text}>{userInfo.followCount || 0}</p>
            </div>
            <div className={styles.item}>
              <p className={styles.title}>粉丝</p>
              <p className={styles.text}>{userInfo.fansCount || 0}</p>
            </div>
          </div>
          {!isSameWithMe && (
            <div className={styles.footer}>
              <Button
                onClick={following ? () => { } : (e) => followHandler(e)}
                loading={following}
                className={[styles.btn, btnInfo.className]}
                type="primary"
              >
                {!following && <Icon className={styles.icon} name={btnInfo.icon} size={12} />}
                {btnInfo.text}
              </Button>
              <Button onClick={(e) => messagingHandler(e)} className={[styles.btn, styles.ghost]} type="primary" ghost>
                <Icon className={styles.icon} name="NewsOutlined" size={12} />
                发私信
              </Button>
              <Button
                onClick={blocking ? () => { } : (e) => blockingHandler(e)}
                loading={blocking}
                // className={`${styles.btn} ${styles.blocked}`}
                className={`${styles.btn}`}

                type="primary"
              >
                {!blocking && (
                  <>
                    <Icon className={styles.icon} name="ShieldOutlined" size={12} />
                    {userInfo.isDeny ? <span>已屏蔽</span> : <span>屏蔽</span>}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }, [userInfo, isShowUserInfo, userId, isSameWithMe]);

  const userTypeIcon =
    userType === 1 ? 'LikeOutlined' : userType === 2 ? 'HeartOutlined' : userType === 3 ? 'HeartOutlined' : '',
    bgClrBasedOnType =
      userType === 1 ? styles.like : userType === 2 ? styles.heart : userType === 3 ? styles.heart : '';

  const referenceElement = useRef(null);
  const popperElement = useRef(null);
  useEffect(() => {
    if (isShow) {
      createPopper(referenceElement.current, popperElement.current, {
        placement: 'bottom-start',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ],
      });
    }
  }, [isShow]);

  if (currAvatarImage && currAvatarImage !== '') {
    return (
      <div className={`${styles.avatarBox} ${wrapClassName}`} onMouseEnter={onMouseEnterHandler} onMouseLeave={onMouseLeaveHandler}>
        <div onClick={clickAvatar} ref={referenceElement}>
          <Avatar className={className} circle={circle} image={currAvatarImage} size={size}></Avatar>
          {userTypeIcon && (
            <div className={`${styles.userIcon} ${bgClrBasedOnType}`}>
              <Icon name={userTypeIcon} size={12} />
            </div>
          )}
        </div>

        {isShow && (
          <div ref={popperElement} style={{ zIndex: 100 }}>
            {userInfoBox}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${styles.avatarBox} ${wrapClassName}`} onMouseEnter={onMouseEnterHandler} onMouseLeave={onMouseLeaveHandler}>
      <div onClick={clickAvatar} ref={referenceElement}>
        <Avatar className={className} circle={circle} text={userName} size={size} onClick={clickAvatar}></Avatar>
        {userTypeIcon && (
          <div className={`${styles.userIcon} ${bgClrBasedOnType}`}>
            <Icon name={userTypeIcon} size={12} />
          </div>
        )}
      </div>

      {isShow && (
        <div ref={popperElement} style={{ zIndex: 100 }}>
          {userInfoBox}
        </div>
      )}
    </div>
  );
}
export default inject('user', 'search')(withRouter(avatar));
