import React, { useEffect, useMemo, useRef, useState, forwardRef } from 'react';
import { Avatar, ImagePreviewer, Icon } from '@discuzqsdk/design';
import { diffDate } from '@common/utils/diff-date';
import { inject, observer } from 'mobx-react';
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';
import { getMessageImageSize } from '@common/utils/get-message-image-size';

import styles from './index.module.scss';
import Router from '@discuzqsdk/sdk/dist/router';
import classnames from 'classnames';

const DialogBox = (props, ref) => {
  const { site: { isPC }, message, showEmoji, messagesList, sendImageAttachment } = props;
  const { dialogMsgList } = message;
  const [previewerVisibled, setPreviewerVisibled] = useState(false);
  const [defaultImg, setDefaultImg] = useState('');
  const [imagePreviewerUrls, setImagePreviewerUrls] = useState([]);

  const renderImage = (data) => {
    const { isImageLoading, imageUrl, renderUrl, imageWidth, imageHeight } = data;
    let [width, height] = [150, 150];
    if (isImageLoading) {
      [width, height] = getMessageImageSize(imageWidth, imageHeight, isPC);
    } else {
      const size = imageUrl.match(/width=(\d+)&height=(\d+)$/);
      if (size) {
        [width, height] = getMessageImageSize(size[1], size[2], isPC);
      }
    }

    return (
      <div className={styles['msgImage-container']} style={{ width: `${width}px`, height: `${height}px` }}>
        {renderImageStatus(data)}
        <img
          className={styles.msgImage}
          src={renderUrl || imageUrl}
          alt={renderUrl || imageUrl}
          onClick={() => {
            setImagePreviewerUrls(dialogMsgList.list.filter(item => (!item.isImageLoading && item.imageUrl)).map(item => item.imageUrl).reverse())
            setTimeout(() => {
              setDefaultImg(imageUrl);
              setPreviewerVisibled(true);
            }, 0);
          }}
        />
      </div>
    );
  };

  const renderImageStatus = (data) => {
    const { isImageFail, isImageLoading, file, failMsg } = data;
    const size = isPC ? 30 : 20;

    if (isImageLoading) {
      return (
        <div className={classnames(styles.status, {
          [styles.fail]: isImageFail || failMsg,
          [styles.uploading]: !isImageFail && !failMsg,
        })}>
          {isImageFail || failMsg ? (
            <>
              <Icon className={styles.failIcon} name="PictureErrorOutlined" size={size} />
              {failMsg && <span className={styles.failMsg}>{failMsg}</span>}
              <Icon className={styles.redDot} name="TipsOutlined" size={16} onClick={() => {
                sendImageAttachment(file, data.dialogId, true);
              }} />
            </>
          ) : (
            <Icon className={styles.loadingIcon} name="LoadingOutlined" size={size} />
          )}
        </div>
      );
    }
  }

  return (
    <div
      className={classnames({
        [styles.pcDialogBox]: isPC,
        [styles.h5DialogBox]: !isPC,
        [styles['h5DialogBox-emoji']]: !isPC && showEmoji,
      })}
      ref={ref}
    >
      <div className={styles.box__inner}>
        {messagesList.map((item) => {
          const { id, timestamp, displayTimePanel, text, ownedBy, userAvatar, imageUrl, userId, nickname } = item;
          return (
            <React.Fragment key={id}>
              {displayTimePanel && <div className={styles.msgTime}>{timestamp}</div>}
              <div className={`${ownedBy === 'myself' ? `${styles.myself}` : `${styles.itself}`} ${styles.persona}`}>
                <div className={styles.profileIcon} onClick={() => {
                  userId && Router.push({ url: `/user/${userId}` });
                }}>
                  {userAvatar
                    ? <Avatar image={userAvatar} circle={true} />
                    : <Avatar text={nickname && nickname.toUpperCase()[0]} circle={true} style={{
                      backgroundColor: "#8590a6",
                    }} />
                  }
                </div>
                {imageUrl ? (
                  renderImage(item)
                ) : (
                  <div className={styles.msgContent} dangerouslySetInnerHTML={{
                    __html: xss(s9e.parseEmoji(text)),
                  }}></div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <ImagePreviewer
        visible={previewerVisibled}
        onClose={() => {
          setPreviewerVisibled(false);
          document.body.className = '';
        }}
        imgUrls={imagePreviewerUrls}
        currentUrl={defaultImg}
      />
    </div>
  );
};

export default inject('message', 'user', 'site')(observer(forwardRef(DialogBox)));
