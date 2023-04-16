/* eslint-disable prefer-destructuring */
/* eslint-disable no-else-return */
/* eslint-disable no-param-reassign */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { inject, observer } from 'mobx-react';
import { Toast } from '@discuzqsdk/design';
import Header from '@components/header';
import BaseLayout from '@components/base-layout';
import DialogBox from './dialog-box';
import InteractionBox from './interaction-box';
import Router from '@discuzqsdk/sdk/dist/router';
import wxChooseImage from '@common/utils/wx-choose-image';
import { createAttachment } from '@common/server';
import { getMessageTimestamp } from '@common/utils/get-message-timestamp';
import calcCosImageQuality from '@common/utils/calc-cos-image-quality';
import styles from './index.module.scss';

// 用户已被屏蔽
const USER_SHIELDING = -4001;
// 私信禁用
const MSG_FORBIDDEN = -11000;

const Index = (props) => {
  const { site: { isPC, webConfig }, dialogId, userId, nickname, message, threadPost, user } = props;
  const { supportImgExt, supportMaxSize } = webConfig?.setAttach;
  const { clearMessage, readDialogMsgList, createDialogMsg, createDialog, readDialogIdByUsername, dialogMsgList, updateDialog } = message;

  const dialogBoxRef = useRef();
  const timeoutId = useRef();
  const uploadRef = useRef();
  const uploadingImagesRef = useRef([]);
  const listDataLengthRef = useRef(0);

  let toastInstance = null;

  const [showEmoji, setShowEmoji] = useState(false);
  const [typingValue, setTypingValue] = useState('');
  const [isSubmiting, setIsSubmiting] = useState(false);

  // 消息框滚动条滚动到底部
  const scrollEnd = () => {
    if (dialogBoxRef.current) {
      dialogBoxRef.current.scrollTop = dialogBoxRef?.current?.scrollHeight;
    }
  };

  // 每10秒轮询一次
  const updateMsgList = () => {
    readDialogMsgList(dialogId);
    clearPolling();
    timeoutId.current = setTimeout(() => {
      updateMsgList();
    }, 10000);
  };

  // 清除轮询
  const clearPolling = () => clearTimeout(timeoutId.current);

  // 获取dialogid后把其放到url中
  const replaceRouteWidthDialogId = (dialogId) => {
    Router.replace({ url: `/message?page=chat&nickname=${nickname}&userId=${userId}&dialogId=${dialogId}` });
  };

  // 消息发送
  const submit = async (data) => {
    if (isSubmiting) return;
    let ret = {};
    if (dialogId) {
      setIsSubmiting(true);
      ret = await createDialogMsg({
        dialogId: parseInt(dialogId),
        ...data,
      });
      setIsSubmiting(false);
      if (ret.code === 0) {
        if (!data.imageUrl) setTypingValue('');
        readDialogMsgList(dialogId);
      } else {
        Toast.error({ content: ret.msg });
      }
    }

    if (!dialogId && userId) {
      setIsSubmiting(true);
      ret = await createDialog({
        recipientUserId: userId,
        ...data,
      });
      setIsSubmiting(false);
      if (ret.code === 0) {
        if (!data.imageUrl) setTypingValue('');
        replaceRouteWidthDialogId(ret.data.dialogId);
      } else {
        Toast.error({ content: ret.msg });
      }
    }
  };

  // 为图片发送空消息
  const submitEmptyImage = dialogId => createDialogMsg({
    dialogId: parseInt(dialogId),
    isImage: true,
  });

  // 清除toast
  const clearToast = () => {
    toastInstance?.destroy();
  };

  // 触发图片选择
  const uploadImage = async () => {
    const files = await wxChooseImage();
    if (files.length) {
      onImgChange('', files);
    } else {
      uploadRef.current.click();
    }
  };

  // 检查文件类型和体积
  const checkFile = (file) => {
    if (!webConfig) return false;
    const imageType = file.type.replace('image/', '');
    const imageSize = file.size;
    const isLegalType = supportImgExt.toLocaleLowerCase().includes(imageType);
    const isLegalSize = imageSize > 0 && imageSize < supportMaxSize * 1024 * 1024;

    if (!isLegalType) {
      return '格式错误';
    }

    if (!isLegalSize) {
      // Toast.info({ content: `仅支持0 ~ ${supportMaxSize}MB的图片` });
      return '体积过大';
    }

    return false;
  };

  // 执行图片发送事宜
  const onImgChange = async (e, wxFiles) => {
    let files = [];
    if (wxFiles) {
      files = wxFiles;
    } else {
      files = e.target.files;
    }

    // 处理首次发消息，还没有dialogId的情况
    let localDialogId = 0;
    if (!dialogId) {
      const ret = await createDialog({
        recipientUserId: userId,
        isImage: true,
      });
      const { code, data } = ret;
      if (code === 0) {
        localDialogId = data.dialogId;
      }
    }

    // 开始处理图片发送
    const fileList = [...files];

    toastInstance = Toast.loading({
      content: '图片压缩中...',
      duration: 0,
    });

    // 先获取图片本地的路径（base64）、再异步获取图片的宽高
    await Promise.all(fileList.map(file => (
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          file.imageUrl = img.src;
          file.imageWidth = img.width;
          file.imageHeight = img.height;
          file.failMsg = checkFile(file);
          resolve();
        };

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          img.src = e.target.result;
        };
      })
    )));

    Promise.all(fileList.map(() => submitEmptyImage(dialogId || localDialogId))).then((results) => {
      if (results[0]?.code === USER_SHIELDING || results[0]?.code === MSG_FORBIDDEN) {
        clearToast();
        Toast.error({ content: results[0].msg });
        return;
      }
      // 把消息id从小到大排序
      results.sort((a, b) => a.data.dialogMessageId - b.data.dialogMessageId);

      // 把本地图片和消息id对应起来
      fileList.forEach((file, i) => {
        const { code, data: { dialogMessageId } } = results[i];
        if (code === 0) {
          file.dialogMessageId = dialogMessageId;
        }
      });
      // 维护本地图片队列
      uploadingImagesRef.current = uploadingImagesRef.current.concat(fileList);
      readDialogMsgList(dialogId || localDialogId).then(() => {
        clearToast();
      });

      // 开始上传图片
      fileList.map(async (file) => {
        sendImageAttachment(file, dialogId || localDialogId);
      });

      if (!dialogId) {
        replaceRouteWidthDialogId(localDialogId);
      } else {
        readDialogMsgList(dialogId);
      }
    });
  };

  // 提交图片
  const sendImageAttachment = async (file, dialogId, isResend) => {
    if (file.failMsg) return;
    if (isResend) {
      uploadingImagesRef.current.forEach((item) => {
        if (item.dialogMessageId === file.dialogMessageId) {
          item.isImageFail = false;
          readDialogMsgList(dialogId);
        }
      });
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 4);
    formData.append('dialogMessageId', file.dialogMessageId);
    const ret = await createAttachment(formData);
    if (ret.code !== 0) file.isImageFail = true;
    readDialogMsgList(dialogId);
  };

  const doSubmitClick = async () => {
    if (!typingValue.trim()) return;
    submit({ messageText: typingValue, isImage: false });
  };

  const filterTag = (html) => {
    return html?.replace(/<(\/)?([beprt]|br|div|h\d)[^>]*>|[\r\n]/gi, '');
  }

  const messagesList = useMemo(() => {
    const listData = dialogMsgList.list.map((item) => {
      if (item.isImageLoading && uploadingImagesRef.current.length) {
        uploadingImagesRef.current.forEach((file) => {
          if (file.dialogMessageId === item.id) {
            item = {
              ...item,
              ...file,
              file,
            };
          }
        });
      }

      // 处理图片格式和体积
      if (!item.isImageLoading && item.imageUrl) {
        const [path] = item.imageUrl.split('?');
        const type = path.substr(path.indexOf('.') + 1);
        item.renderUrl = calcCosImageQuality(item.imageUrl, type, 7);
      }

      return {
        ...item,
        timestamp: item.createdAt,
        userAvatar: item.user.avatar,
        displayTimePanel: true,
        textType: 'string',
        text: filterTag(item.messageText),
        ownedBy: user.id === item.userId ? 'myself' : 'itself',
        nickname: item.user.username,
      };
    }).filter(item => (item.imageUrl || item.text))
      .reverse();

    // 消息数有变化，即有新消息，此时把滚动条滚动到底部
    if (listData.length > listDataLengthRef.current) {
      listDataLengthRef.current = listData.length;
      setTimeout(() => {
        scrollEnd();
        // 把消息状态更新为已读
        updateDialog(dialogId);
      }, 100);
    }

    return getMessageTimestamp(listData);
  }, [dialogMsgList]);

  useEffect(async () => {
    clearMessage();
    if (userId && !dialogId) {
      const res = await readDialogIdByUsername(userId);
      const { code, data: { dialogId } } = res;
      if (code === 0 && dialogId) {
        replaceRouteWidthDialogId(dialogId);
      }
    }
  }, [userId, dialogId]);

  useEffect(() => {
    document.body.className = '';

    if (!threadPost.emojis.length) {
      threadPost.fetchEmoji();
    }
    return () => {
      clearPolling();
      clearMessage();
      clearToast();
    };
  }, []);

  // 切换username时，停止当前轮询，用于pc端对话页右下角点击切换聊天用户的场景
  useEffect(() => {
    listDataLengthRef.current = 0;
    setTypingValue('');
    clearPolling();
  }, [userId]);

  // 有dialogId开始执行轮询更新消息机制
  useEffect(() => {
    if (dialogId) {
      clearPolling();
      updateMsgList();
    }
  }, [dialogId]);

  // 弹出表情时，消息列表拉到最底下
  useEffect(() => {
    if (showEmoji) {
      setTimeout(scrollEnd, 0);
    }
  }, [showEmoji]);

  const mainContent = (
    <div className={isPC ? styles.pcPage : styles.h5Page}>
      {isPC ? (
        <div className={styles['pc-header']}>
          <div className={styles['pc-header__inner']}>
            {nickname}
          </div>
        </div>)
        : <Header />
      }
      <input
        style={{ display: 'none' }}
        type="file"
        multiple="multiple"
        ref={uploadRef}
        onChange={onImgChange}
        accept={supportImgExt ? supportImgExt.split(',').map(str => `image/${str}`).join(',') : 'image/*'}
      />
      <DialogBox
        ref={dialogBoxRef}
        messagesList={messagesList}
        showEmoji={showEmoji}
        sendImageAttachment={sendImageAttachment}
      />
      <InteractionBox
        scrollEnd={scrollEnd}
        typingValue={typingValue}
        setTypingValue={setTypingValue}
        uploadImage={uploadImage}
        doSubmitClick={doSubmitClick}
        showEmoji={showEmoji}
        setShowEmoji={setShowEmoji}
      />
    </div>
  );

  if (isPC) {
    return (
      <BaseLayout
        className={'mymessage-page'}
        right={props.rightContent}
        showRefresh={false}
        immediateCheck={false}
        isShowLayoutRefresh={false}
      >
        {mainContent}
      </BaseLayout>
    );
  }

  return mainContent;
};

export default inject('message', 'site', 'threadPost', 'user')(observer(Index));
