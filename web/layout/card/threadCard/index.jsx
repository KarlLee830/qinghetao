import React, { useRef, useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { parseContentData } from '../../thread/utils';
import ImageDisplay from '@components/thread/image-display';
import PostContent from '@components/thread/post-content';
import UserInfo from '@components/thread/user-info';
import styles from './index.module.scss';
import { cutText, hideImage} from '../util';


const ThreadCard = inject('user', 'card')(observer((props) => {
  const { card: threadStore } = props;
  const { isReady, imgReadyLength, imgReady } = threadStore;
  let { text, indexes } = threadStore?.threadData?.content || {};
  const { parentCategoryName, categoryName } = threadStore?.threadData || {};
  let title = threadStore?.threadData?.title;
  let parseContent = parseContentData(indexes);
  const isEssence = threadStore?.threadData?.displayTag?.isEssence || false;
  // 是否免费帖
  const isFree = threadStore?.threadData?.payType === 0;
  // 是否红包帖
  const isRedPack = threadStore?.threadData?.displayTag?.isRedPack;
  // 是否悬赏帖
  const isReward = threadStore?.threadData?.displayTag?.isReward;
  let nickname = threadStore?.threadData?.user?.nickname;
  let avatar = threadStore?.threadData?.user?.avatar;
  const isAnonymous = threadStore?.threadData?.isAnonymous;
  const priceImg = '/dzq-img/admin-logo-pc.jpg';
  const content = useRef(null);
  const cardContent = useRef(null);
  const [overMaxHeight, setOverMaxHeight] = useState(false);
  const contentMaxHeight = window.innerHeight - 171 - 20;
  const cardContentHeight = cardContent?.current?.scrollHeight;
  const posthandle = str => (str.length > 6 ? `${str.slice(0, 6)}...` : str);

  // 内容是否为空
  let isEmpty = false;
  if (!text && !title && !parseContent.IMAGE) {
    isEmpty = true;
  }


  useEffect(() => {
    if (!parseContent?.IMAGE) {
      threadStore.setImgReady();
    }
    if (imgReadyLength === parseContent?.IMAGE?.length) {
      threadStore.setImgReady();
      threadStore.clearImgReadyLength();
    }
    if (imgReady && content?.current?.scrollHeight >= 1900) {
      setOverMaxHeight(true);
    }
  });
  const postLoad = () => {
    threadStore.setImgReadyLength();
  };
  // 处理匿名情况
  if (isAnonymous) {
    nickname = '匿名用户';
    avatar = '';
  }
  // 处理付费情况
  if (!isFree) {
    title = '';
    text = '';
    parseContent = '';
  }

  const filterIframe = /<iframe(([\s\S])*?)<\/iframe>/g; // iframe标签不支持生成h5海报
  text = text.replace(filterIframe, '');
  // 隐藏部分内容
  if (props.hidePart && cardContentHeight < contentMaxHeight) {
    text = cutText(text);
  }
  return (
    <div ref={cardContent} className={props.hidePart ? styles.hidePart : ''} style={{ maxHeight: props.hidePart ? contentMaxHeight : 'none' }}>
      {
        props.hidePart && cardContentHeight > contentMaxHeight && <img className={styles.hideImage} src={hideImage} />
      }
      {isReady && (
      <div className={`${styles.container}`}>
        <div className={styles.header}>
          <div className={styles.userInfo}>
            <UserInfo
              name={ posthandle(nickname || '')}
              avatar={avatar || ''}
              location={threadStore?.threadData?.position?.location || ''}
              groupName={isAnonymous ? '' : (threadStore?.threadData?.group?.groupName || '') }
              view={`${threadStore?.threadData?.viewCount}` || ''}
              time={`${threadStore?.threadData?.diffTime}` || ''}
              userId={threadStore?.threadData?.user?.userId}
              isEssence={isEssence}
              isPay={!isFree}
              isReward={isReward}
              isRed={isRedPack}
            ></UserInfo>
          </div>
        </div>

        <div className={styles.body} ref={content}>
          {/* 标题 */}
          {title && <div className={styles.title}>{title}</div>}

          {/* 文字 */}
          {text && !(props.hidePart && cardContentHeight < contentMaxHeight) && <PostContent needShowMore={false} content={text || ''} className={styles.content}/>}

          { props.hidePart && cardContentHeight < contentMaxHeight && <div className={styles.cutText}>{text} </div> }


          {/* 图片 */}
          {!(props.hidePart && cardContentHeight < contentMaxHeight) && parseContent.IMAGE && (
            <ImageDisplay
              flat
              platform="h5"
              imgData={parseContent.IMAGE}
              showLongPicture={false}
              postLoad={postLoad}
            />
          )}
          {/* 付费 */}
          {(!isFree || isEmpty) && (
            <div className={styles.imgBox}>
              <img alt="图片" src={priceImg} className={styles.priceimg}/>
            </div>
          )}

        </div>
        {overMaxHeight && (
            <div className={styles.lookmoreBox}>
              <img src="/dzq-img/look-more.jpg" alt="扫码查看更多" className={styles.lookmoreImg}/>
            </div>
        )}
          {/* 标签 */}
          {(parentCategoryName || categoryName) && (
            <div className={styles.tag}>
              {parentCategoryName ? `${parentCategoryName}/${categoryName}` : categoryName}
            </div>
          )}
      </div>
      )}

    </div>
  );
}));

export default ThreadCard;

