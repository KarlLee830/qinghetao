import React, { useRef, useEffect, useMemo, useState } from 'react';
import { View, Image, Text } from '@tarojs/components';
import Avatar from '@discuzqsdk/design/dist/components/avatar/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import { diffDate } from '@common/utils/diff-date';
import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import Taro, { setClipboardData } from '@tarojs/taro';
import styles from './index.module.scss';
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';

const DialogBox = (props) => {
  const { message, dialogId, showEmoji, keyboardHeight, hideEmoji, scrollEnd, messagesHistory, sendImageAttachment } = props;
  const { readDialogMsgList, dialogMsgList } = message;

  const [paddingBottom, setPaddingBottom] = useState(52);
  const [selectId, setSelectId] = useState(null);

  const dialogBoxRef = useRef();
  const timeoutId = useRef();
  const timeoutCopy = useRef();
  useEffect(() => {
    return () => clearTimeout(timeoutId.current);
  }, []);

  useEffect(() => {
    if (dialogId) {
      clearTimeout(timeoutId.current);
      updateMsgList();
    }
  }, [dialogId]);

  useEffect(() => {
    if (showEmoji || keyboardHeight) {
      setTimeout(scrollEnd, 300);
    }

    setTimeout(() => {
      let query = Taro.createSelectorQuery();
      query.select('#operation-box').boundingClientRect(rect => {
        let clientHeight = rect.height;
        setPaddingBottom(clientHeight);
        setTimeout(scrollEnd, 300);
      }).exec();
    }, 0);

  }, [showEmoji, keyboardHeight]);


  // 每20秒轮询一次
  const updateMsgList = () => {
    readDialogMsgList(dialogId);
    clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(() => {
      updateMsgList();
    }, 20000);
  };

  const renderImageStatus = (data) => {
    const { isImageFail, isImageLoading, file, failMsg } = data;
    const size = 20;

    if (isImageLoading) {
      return (
        <View className={classnames(styles.status, {
          [styles.fail]: isImageFail || failMsg,
          [styles.uploading]: !isImageFail && !failMsg,
        })}>
          {isImageFail || failMsg ? (
            <>
              <Icon className={styles.failIcon} name="PictureErrorOutlined" size={size} />
              {failMsg && <Text className={styles.failMsg}>{failMsg}</Text>}
              <Icon className={styles.redDot} name="TipsOutlined" size={16} onClick={() => {
                sendImageAttachment(file, true);
              }} />
            </>
          ) : (
            <Icon className={styles.loadingIcon} name="LoadingOutlined" size={size} />
          )}
        </View>
      );
    }
  }
  const copy = (text, id) => {
    setSelectId(id);
    timeoutCopy.current = setTimeout(() => {
      setClipboardData({
        data: text,
        fail: (err) => {
          console.error(err);
          Toast.error({
            content: '复制失败'
          })
        }
      })

    }, 500);
  }

  const copyOver = () => {
    setSelectId(null);
    clearTimeout(timeoutCopy.current);
  }

  const renderImage = (data) => {
    const { imageUrl, renderUrl, width, height } = data;

    return (
      <View className={styles['msgImage-container']} style={{ width: `${width}px`, height: `${height}px` }}>
        {renderImageStatus(data)}
        <Image
          className={styles.msgImage}
          mode='aspectFill'
          src={renderUrl || imageUrl}
          onClick={() => {
            Taro.previewImage({
              urls: dialogMsgList.list.filter(item => (item.imageUrl && !item.isImageLoading)).map(item => item.imageUrl).reverse(),
              current: imageUrl,
            });
          }}
        />
      </View>
    );
  };

  return (
    <View
      onClick={() => {
        hideEmoji();
      }}
      className={styles.dialogBox}
      style={{
        paddingBottom: `${paddingBottom}px`,
      }}
      ref={dialogBoxRef}>
      <View className={styles.box__inner}>
        {messagesHistory.map((item) => {
          const { id, timestamp, displayTimePanel, text, ownedBy, userAvatar, imageUrl, userId, nickname, width, height } = item;
          return (
            <React.Fragment key={id}>
              {displayTimePanel && timestamp && <View className={styles.msgTime}>{timestamp}</View>}
              <View className={(ownedBy === 'myself' ? `${styles.myself}` : `${styles.itself}`) + ` ${styles.persona}`}>
                <View className={styles.profileIcon} onClick={() => {
                  userId && Taro.navigateTo({ url: `/userPages/user/index?id=${userId}` });
                }}>
                  {userAvatar
                    ? <Avatar image={userAvatar} circle={true} />
                    : <Avatar text={nickname && nickname.toUpperCase()[0]} circle={true} style={{
                      backgroundColor: "#8590a6",
                    }} />
                  }
                </View>
                {imageUrl ? (
                  renderImage(item)
                ) : (
                  <View className={`${styles.msgContent} ${selectId === id ? styles.msgSelect : ''}`} dangerouslySetInnerHTML={{
                    __html: xss(s9e.parseEmoji(text)),
                  }} onTouchStart={() => {copy(xss(text), id)}} onTouchMove={copyOver} onTouchEnd={copyOver}></View>
                )}
              </View>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

export default inject('message', 'user')(observer(DialogBox));
