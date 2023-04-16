import React, { useMemo, useEffect, useState } from 'react';
import styles from './index.module.scss';
import Tip from '../tip';
import { Icon } from '@discuzqsdk/design';
import { noop } from '../utils';
import MorePopop from '@components/more-popop';
import Router from '@discuzqsdk/sdk/dist/router';
import goToLoginPage from '@common/utils/go-to-login-page';
import Toast from '@discuzqsdk/design/dist/components/toast';
// const hongbaoMini = 'https://cloudcache.tencentcs.com/operation/dianshi/other/redpacket-mini.10b46eefd630a5d5d322d6bbc07690ac4536ee2d.png';
import hongbaoicon from './hongbaoicon';

/**
 * 帖子底部内容
 * @prop {array}    userImgs 点赞分享用户信息
 * @prop {number}    wholeNum 全部人数
 * @prop {number}    comment 评论人数
 * @prop {number}    sharing 分享人数
 * @prop {number}    onShare 分享事件
 * @prop {number}    onComment 评论事件
 * @prop {number}    onPraise 点赞事件
 */
const Index = ({
  userImgs = [],
  wholeNum = 0,
  comment = 0,
  sharing = 0,
  isLiked = false,
  isCommented = false,
  isSendingLike = false,
  tipData,
  platform,
  card,
  data,
  user,
  onShare = () => { },
  onComment = () => { },
  onPraise = () => { },
  updateViewCount = noop,
  handleShare = noop,
  hasCommentHongbao = false,
}) => {
  const postList = useMemo(() => {
    const praise = {
      icon: 'LikeOutlined',
      name: '赞',
      event: onPraise,
      type: 'like',
      num: wholeNum,
      actived: isLiked,
    };

    return [
      praise,
      {
        icon: 'MessageOutlined',
        name: '评论',
        event: onComment,
        type: 'commonet',
        num: comment,
        actived: isCommented,
      },
      {
        icon: 'ShareAltOutlined',
        name: '分享',
        event: onShare,
        type: 'share',
        num: sharing,
      },
    ];
  }, [isLiked, isCommented, wholeNum, comment, sharing]);

  // TODO：此处逻辑需要移植到thread/index中，方便逻辑复用
  const handleClick = (item) => {
    updateViewCount();

    if (item.name === '赞') {
      item.event();
      return;
    }

    const isApproved = data?.isApproved === 1;
    if (!isApproved) {
      Toast.info({ content: '内容正在审核中' });
      return;
    }

    if (item.name === '评论') {
      item.event();
      return;
    }

    if (platform === 'pc') {
      item.event();
    } else {
      if (!user.isLogin()) {
        goToLoginPage({ url: '/user/login' });
        return;
      }
      setShow(true);
    }
  };

  const [show, setShow] = useState(false);
  const onClose = () => {
    setShow(false);
  };
  const handleH5Share = () => {
    onShare();
    onClose();
  };
  const createCard = () => {
    const { threadId } = tipData;
    card.setThreadData(data);
    handleShare();
    Router.push({ url: `/card?threadId=${threadId}` });
  };
  const needHeight = useMemo(() => userImgs.length !== 0, [userImgs]);

  return (
    <div>
      <div className={needHeight ? styles.user : styles.users}>
        {userImgs.length !== 0 ? (
          <div className={styles.userImg}>
            <div className={styles.portrait}>
              <Tip
                tipData={tipData}
                imgs={userImgs}
                wholeNum={wholeNum}
                showCount={platform === 'pc' ? 10 : 5}
                platform={platform}
                updateViewCount={updateViewCount}
              ></Tip>
            </div>
            {/* {wholeNum !== 0 && <p className={styles.numText}>{wholeNum}</p>} */}
          </div>
        ) : (
          <div></div>
        )}
        {/* <div className={styles.commentSharing}>
          {comment > 0 && <p className={styles.commentNum}>{`${comment}条评论`}</p>}
          {comment > 0 && sharing > 0 && <p className={styles.division}>·</p>}
          {sharing > 0 && <p className={styles.commentNum}>{`${sharing}次分享`}</p>}
        </div> */}
      </div>

      <div className={needHeight ? styles.operation : styles.operations}>
        {postList.map((item, index) => (
          <div key={index} className={styles.fabulousContainer}>
            <div className={styles.fabulous} onClick={() => handleClick(item)}>
              {
                item.name === '评论' &&  hasCommentHongbao ? (
                  <img title='回复领红包' className={styles.hongbaoMini} src={hongbaoicon}></img>
                ) : (
                  <Icon
                  className={`${styles.icon} ${item.type} ${item.actived ? styles.likedColor : styles.dislikedColor}`}
                  name={item.icon}
                  size={16}
                ></Icon>
                )
              }
              <span className={item.actived ? styles.fabulousCancel : styles.fabulousPost}>
                {item.num ? item.num : item.name}
              </span>
              {/* {item.hasHongbao &&  <img className={styles.hongbaoMini} src={hongbaoMini}></img>} */}
            </div>
          </div>
        ))}
      </div>
      {show && (
        <MorePopop
          show={show}
          fromThread
          handleH5Share={handleH5Share}
          onClose={onClose}
          createCard={createCard}
        ></MorePopop>
      )}
    </div>
  );
};
export default React.memo(Index);
