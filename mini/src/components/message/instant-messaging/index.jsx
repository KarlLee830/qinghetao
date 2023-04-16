import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View } from '@tarojs/components';
import { inject, observer } from 'mobx-react';
import Taro from '@tarojs/taro';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import DialogBox from './dialog-box';
import InteractionBox from './interaction-box';
import styles from './index.module.scss';
import constants from '@common/constants';
import locals from '@common/utils/local-bridge';
import { getMessageImageSize } from '@common/utils/get-message-image-size';
import { getMessageTimestamp } from '@common/utils/get-message-timestamp';
import calcCosImageQuality from '@common/utils/calc-cos-image-quality';

// 用户已被屏蔽
const USER_SHIELDING = -4001;
const MSG_FORBIDDEN = -11000;

const Index = ({ message, user, site: { webConfig, envConfig }, dialogId: _dialogId, userId, nickname, threadPost }) => {

  const { clearMessage, readDialogMsgList, dialogMsgList, updateDialog, createDialogMsg, createDialog, readDialogIdByUsername } = message;
  const { supportImgExt, supportMaxSize } = webConfig?.setAttach;

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [dialogId, setDialogId] = useState(_dialogId);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [typingValue, setTypingValue] = useState('');

  const uploadingImagesRef = useRef([]);
  const listDataLengthRef = useRef(0);

  const scrollEnd = () => {
    setTimeout(() => {
      Taro.pageScrollTo({
        scrollTop: 30000,
        duration: 0
      });
    }, 0);
  };

  const doSubmitClick = async () => {
    setShowEmoji(false);
    if (!typingValue.trim()) return;
    submit({ messageText: typingValue, isImage: false });
  };

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
      Taro.hideLoading();
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
      Taro.hideLoading();
      if (ret.code === 0) {
        if (!data.imageUrl) setTypingValue('');
        setDialogId(ret.data.dialogId);
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

  // 检查文件类型和体积
  const checkFile = (file) => {
    if (!webConfig) return false;
    const imageType = file.path.match(/\.([^\.]+)$/)[1].toLocaleLowerCase();
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

  // 提交图片
  const sendImageAttachment = async (file, isResend) => {
    if (file.failMsg) return;
    if (isResend) {
      uploadingImagesRef.current.forEach((item) => {
        if (item.dialogMessageId === file.dialogMessageId) {
          item.isImageFail = false;
          readDialogMsgList(dialogId);
        }
      });
    }

    const token = locals.get(constants.ACCESS_TOKEN_NAME);
    Taro.uploadFile({
      url: `${envConfig.COMMON_BASE_URL}/api/v3/attachments`,
      filePath: file.path,
      name: 'file',
      header: {
        'Content-Type': 'multipart/form-data',
        'authorization': `Bearer ${token}`
      },
      formData: {
        type: 4,
        dialogMessageId: file.dialogMessageId,
      },
      success(res) {
        if (res.statusCode === 200) {
          const ret = JSON.parse(res.data);
          const { Data: data, Code, Message: msg } = ret;
          if (Code === 0) {

          } else {
            // Toast.error({ content: msg || '图片发送失败' });
            file.isImageFail = true;
          }
        } else {
          // Toast.error({ content: '网络发生错误' });
          file.isImageFail = true;
        }
        readDialogMsgList(dialogId);
      }
    });
  };

  // 触发图片选择
  const chooseImage = () => {
    Taro.chooseImage({
      count: 9,
      success(res) {
        onImgChange(res.tempFiles)
      }
    });
  };

  const onImgChange = async (files) => {
    let localDialogId = 0;
    if (!dialogId) {
      const ret = await createDialog({
        recipientUserId: userId,
        isImage: true,
      });
      const { code, data } = ret;
      if (code === 0) {
        localDialogId = data.dialogId;
        setDialogId(data.dialogId);
      }
    }

    // 先获取图片本地的路径、再异步获取图片的宽高
    await Promise.all(files.map(file => {
      new Promise(resolve => {
        Taro.getImageInfo({
          src: file.path,
          complete: ({ width, height, type }) => {
            file.width = width;
            file.height = height;
            file.type = type;
            file.imageUrl = file.path;
            file.failMsg = checkFile(file);
            resolve();
          }
        });
      });
    }));

    Promise.all(files.map(() => submitEmptyImage(dialogId || localDialogId))).then((results) => {
      if (results[0]?.code === USER_SHIELDING || results[0]?.code === MSG_FORBIDDEN) {
        Toast.error({ content: results[0].msg });
        return;
      }
      // 把消息id从小到大排序
      results.sort((a, b) => a.data.dialogMessageId - b.data.dialogMessageId);

      // 把本地图片和消息id对应起来
      files.forEach((file, i) => {
        const { code, data: { dialogMessageId } } = results[i];
        if (code === 0) {
          file.dialogMessageId = dialogMessageId;
        }
      });
      // 维护本地图片队列
      uploadingImagesRef.current = uploadingImagesRef.current.concat(files);
      readDialogMsgList(dialogId || localDialogId).then(() => {
        // clearToast();
      });

      // 开始上传图片
      files.map(async (file) => {
        sendImageAttachment(file);
      });

      readDialogMsgList(dialogId || localDialogId);
    });
  };

  const filterTag = (html) =>{
    return html?.replace(/<(\/)?([beprt]|br|div|h\d)[^>]*>|[\r\n]/gi, '');
  }

  const messagesHistory = useMemo(() => {
    setTimeout(() => {
      // 把消息状态更新为已读
      updateDialog(dialogId);
    }, 100);

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

      let [width, height] = [150, 150]; // 兼容没有返回图片尺寸的旧图片
      if (item.imageUrl) {
        const size = item.imageUrl.match(/width=(\d+)&height=(\d+)$/);
        if (size) {
          [width, height] = getMessageImageSize(size[1], size[2]); // 计算图片显示尺寸
        } else if (item.isImageLoading) {
          [width, height] = getMessageImageSize(item.width, item.height);
        }
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
        width: width,
        height: height,
        nickname: item.user.nickname,
      }
    }).filter(item => (item.imageUrl || item.text)).reverse();

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
    if (userId && !dialogId) {
      const res = await readDialogIdByUsername(userId);
      const { code, data: { dialogId } } = res;
      if (code === 0 && dialogId) {
        setDialogId(dialogId);
      }
    }

    if (!threadPost.emojis.length) {
      threadPost.fetchEmoji();
    }

    return () => {
      Taro.hideLoading();
    };
  }, []);

  useEffect(() => {
    setDialogId(_dialogId);

    // 监听键盘高度变化
    Taro.onKeyboardHeightChange(res => {
      setKeyboardHeight(res?.height || 0);
    });


    return () => {
      clearMessage();
    };
  }, []);

  return (
    <View className={styles.container}>
      <DialogBox
        messagesHistory={messagesHistory}
        scrollEnd={scrollEnd}
        dialogId={dialogId}
        showEmoji={showEmoji}
        sendImageAttachment={sendImageAttachment}
        hideEmoji={() => {
          setShowEmoji(false);
        }}
        keyboardHeight={keyboardHeight}
      />
      <InteractionBox
        doSubmitClick={doSubmitClick}
        typingValue={typingValue}
        setTypingValue={setTypingValue}
        chooseImage={chooseImage}
        keyboardHeight={keyboardHeight}
        showEmoji={showEmoji}
        dialogId={dialogId}
        switchEmoji={(show) => {
          setShowEmoji(show);
        }}
      />
    </View>
  );
};

export default inject('message', 'user', 'threadPost', 'site')(observer(Index));
