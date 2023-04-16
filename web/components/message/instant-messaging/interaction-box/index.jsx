import React, { useState, useEffect, useRef } from 'react';
import { Button, Textarea, Icon, Input, Toast } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import Emoji from '@components/editor/emoji';
import styles from './index.module.scss';

const InteractionBox = (props) => {
  const {
    threadPost,
    showEmoji,
    setShowEmoji,
    setTypingValue,
    uploadImage,
    doSubmitClick,
    typingValue,
    site: { isPC },
    forum,
    scrollEnd,
  } = props;
  const { otherPermissions, setOtherPermissions } = forum;
  const { disabledChat = false } = otherPermissions || {};

  const [cursorPosition, setCursorPosition] = useState(0);

  const inputBoxRef = useRef();


  const recordCursor = (e) => {
    setCursorPosition(e.target.selectionStart);
  };

  const doPressEnter = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.altKey) {
        // enter + alt 换行
        const cursorIndex = e.target.selectionStart;
        const text = typingValue.slice(0, cursorIndex) + "\n" + typingValue.slice(cursorIndex);
        setTypingValue(text);
        setTimeout(() => {
          e.target.selectionStart = e.target.selectionEnd = cursorIndex + 1;
        }, 0);
        return;
      }

      doSubmitClick();
    }
  };

  const insertEmoji = (emoji) => {
    const text = typingValue.slice(0, cursorPosition) + emoji.code + typingValue.slice(cursorPosition);
    setTypingValue(text);
    setCursorPosition(cursorPosition + emoji.code.length);
  };

  useEffect(() => {
    !otherPermissions && setOtherPermissions();
  }, [])

  return (
    <>
      {!isPC && (
        <>
          <div className={styles.h5InteractionBox} style={{ bottom: showEmoji ? '200px' : 0 }} ref={inputBoxRef}>
            <div className={styles.inputWrapper}>
              <Input
                value={typingValue}
                placeholder={disabledChat ? ' 私信已被禁用' : ' 请输入内容'}
                disabled={disabledChat}
                onChange={(e) => {
                  setTypingValue(e.target.value);
                  recordCursor(e);
                }}
                onBlur={(e) => {
                  recordCursor(e);
                  setTimeout(() => {
                    inputBoxRef.current.scrollIntoView(false);
                  }, 300);
                }}
                onFocus={() => {
                  setTimeout(() => {
                    inputBoxRef.current.scrollIntoViewIfNeeded(false);
                    setTimeout(() => {
                      scrollEnd();
                    }, 500);
                  }, 300);
                }}
              />
              <div className={styles.tools}>
                <div>
                  <Icon name="SmilingFaceOutlined" size={20} onClick={(e) => {
                    e.stopPropagation();
                    if (disabledChat) {
                      return Toast.info({ content: `私信已被禁用` });
                    }
                    setShowEmoji(!showEmoji);
                  }} />
                </div>
                <div className={styles.pictureUpload}>
                  <Icon name="PictureOutlinedBig" size={20} onClick={() => {
                    if (disabledChat) {
                      return Toast.info({ content: `私信已被禁用` });
                    }
                    uploadImage();
                  }} />
                </div>
              </div>
            </div>
            <div className={styles.submit}>
              <Button type="primary" disabled={disabledChat} onClick={doSubmitClick}>
                发送
              </Button>
            </div>
          </div>
          <div className={styles.emoji}>
            <Emoji
              onEmojiBlur={() => setShowEmoji(false)}
              show={showEmoji}
              emojis={threadPost.emojis}
              onClick={insertEmoji}
            />
          </div>
        </>
      )}
      {isPC && (
        <div className={styles.pcInteractionBox}>
          <div className={styles.tools}>
            <Emoji
              onEmojiBlur={() => setShowEmoji(false)}
              pc
              show={showEmoji}
              emojis={threadPost.emojis}
              onClick={insertEmoji}
            />
            <div>
              <Icon name="SmilingFaceOutlined" size={20} onClick={(e) => {
                if (disabledChat) {
                  return Toast.info({ content: `私信已被禁用` });
                }
                e.stopPropagation();
                setShowEmoji(!showEmoji);
              }} />
            </div>
            <div className={styles.pictureUpload}>
              <Icon name="PictureOutlinedBig" size={20} onClick={() => {
                if (disabledChat) {
                  return Toast.info({ content: `私信已被禁用` });
                }
                uploadImage();
              }} />
            </div>
          </div>
          <Textarea
            className={styles.typingArea}
            value={typingValue}
            focus={true}
            maxLength={5000}
            rows={3}
            onChange={(e) => {
              setTypingValue(e.target.value);
              recordCursor(e);
            }}
            onBlur={(e) => {
              recordCursor(e);
            }}
            onKeyDown={doPressEnter}
            placeholder={disabledChat ? ' 私信已被禁用' : ' 请输入内容'}
            disabled={disabledChat}
          />
          <div className={styles.submit}>
            <Button className={styles.submitBtn} type="primary" disabled={disabledChat} onClick={doSubmitClick}>
              发送
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default inject('threadPost', 'forum', 'site')(observer(InteractionBox));
