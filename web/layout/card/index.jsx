import { generateImageUrlByHtml, savePic } from './util.js';
import React, { useState, useRef, useEffect, Fragment } from 'react';
import styles from './index.module.scss';
import { Button, Toast, Checkbox} from '@discuzqsdk/design';
import Footer from './footer';
import Header from '@components/header';
import { getClientHeight } from '@common/utils/get-client-height';
import isWeiXin from '@common/utils/is-weixin';
import { inject, observer } from 'mobx-react';
import SiteCard from './siteCard';
import ThreadCard from './threadCard';
import CommentCard from './commentCard';
import ExperienceCard from './experienceCard';
import ExperienceCardHeader from './experienceCard/header';

const Index = ({ card, threadId, user, experience, commentId }) => {
  const [url, setUrl] = useState('');
  const [hidePart, setHidePart] = useState(false);
  const [containHeight, setContainHeight] = useState(null);

  const [ready, setReady] = useState(false);
  const post = useRef(null);
  const { imgReady } = card;
  const showExperienceCard = experience && !threadId && !commentId;
  useEffect(() => {
    document.body.className = '';
    if (showExperienceCard) {
      const cliengtHeight = getClientHeight();
      setContainHeight(cliengtHeight - 138);
    }
  }, []);
  useEffect(() => {
    if (ready && imgReady) {
      generateImageUrlByHtml(post.current).then((res) => {
        setUrl(res);
      });
    }
  }, [ready, imgReady]);

  useEffect(() => {
    if (ready && imgReady) {
      setTimeout(()=>{
        generateImageUrlByHtml(post.current).then((res) => {
          setUrl(res);
        });
      }, 0);
    }
  }, [hidePart]);

  const saveImg = () => {
    savePic(url);
  };
  if (!ready || !imgReady) {
    Toast.loading({ content: '正在绘制...' });
  }

  return (
    <div>
      <Header />
      <div className={`${styles.contain} ${showExperienceCard && ready && imgReady && styles.experienceContain}`} style={containHeight ? {height: containHeight} : {}}>
        {
          showExperienceCard && <ExperienceCardHeader/>
        }
        <div className={styles.poster} ref={post}>
          {/* {!threadId ? <SiteCard></SiteCard> : <ThreadCard threadId={threadId}></ThreadCard>} */}
          {
            commentId && <CommentCard hidePart={hidePart} commentId={commentId}></CommentCard>
          }
          {
            threadId && !commentId &&  <ThreadCard hidePart={hidePart} threadId={threadId}></ThreadCard>
          }
          {
            showExperienceCard && <ExperienceCard setReady={setReady} />
          }
          {
            !threadId && !commentId && !experience && <SiteCard></SiteCard>
          }
          {
            !experience && <Footer setReady={setReady} threadId={threadId} inviteCode={user?.userInfo?.id} commentId={commentId}></Footer>
          }
        </div>
        {ready && imgReady ? (
          <div className={`${styles.imgbox} ${showExperienceCard && styles.experienceImgbox}`}>
            <img alt="" className={styles.centImage} src={url} />
          </div>
        ) : (
          <div className={`${styles.imgbox} ${showExperienceCard && styles.experienceImgbox}`}></div>
        )}
      </div>
      <div className={`${styles.emptyHeight} ${showExperienceCard && styles.experienceEmptyHeight}`}></div>
      <div className={`${styles.shareBtn} ${(commentId || threadId) && styles.hasHidePart} `}>
        {
          (commentId || threadId) && (
            <div className={styles.checkbox}>
            <Checkbox onChange={()=>setHidePart(!hidePart)} checked={hidePart} >隐藏部分内容</Checkbox>
          </div>
          )
        }
        {
          experience && (
            <div className={styles.experience}>
              本功能仅对管理员开放
          </div>
          )
        }
        {!isWeiXin() ? (
          <Button className={styles.btn} onClick={isWeiXin() ? '' : saveImg}>
            保存到相册
          </Button>
        ) : (
          <div className={styles.wxBtn}>长按图片保存到相册</div>
        )}
      </div>
    </div>
  );
};

export default inject('card', 'user')(observer(Index));
