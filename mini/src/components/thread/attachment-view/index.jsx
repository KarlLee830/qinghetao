import React, { useState, useRef, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Spin from '@discuzqsdk/design/dist/components/spin/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import AudioPlayer from '@discuzqsdk/design/dist/components/audio-player/index';
import { AUDIO_FORMAT } from '@common/constants/thread-post';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import getAttachmentIconLink from '@common/utils/get-attachment-icon-link';
import { throttle } from '@common/utils/throttle-debounce.js';
import { ATTACHMENT_FOLD_COUNT } from '@common/constants';
import Router from '@discuzqsdk/sdk/dist/router';
import { readDownloadAttachment } from '@server';
import goToLoginPage from '@common/utils/go-to-login-page';
import styles from './index.module.scss';
import { extensionList, isPromise, noop } from '../utils';

/**
 * 附件 - 免费附件正常展示，付费附件隐藏
 * @prop {Array} attachments 附件数组
 * @prop {Boolean} isHidden 是否隐藏删除按钮
 */

const Index = ({
  attachments = [],
  isHidden = true,
  isPay = false, // 是否需要部分付费
  onClick = noop,
  onPay = noop,
  user = null,
  threadId = null,
  thread = null,
  baselayout,
  updateViewCount = noop,
  unifyOnClick = null,
  canViewAttachment = false,
  canDownloadAttachment = false,
  customActionArea = null,
  showPlayStatus = true,
}) => {
  // 过滤需要部分付费的附件
  const showAttachList = attachments.filter((item) => (item.needPay === undefined ? !isPay : item.needPay !== 1));

  // 处理文件大小的显示
  const handleFileSize = (fileSize) => {
    if (fileSize > 1000000) {
      return `${(fileSize / 1000000).toFixed(2)} M`;
    }
    if (fileSize > 1000) {
      return `${(fileSize / 1000).toFixed(2)} KB`;
    }

    return `${fileSize} B`;
  };

  const fetchDownloadUrl = async (threadId, attachmentId, callback) => {
    if (!threadId || !attachmentId) return;

    // TODO: toastInstance 返回的是boolean
    // let toastInstance = Toast.loading({
    //   duration: 0,
    // });

    await thread
      .fetchThreadAttachmentUrl(threadId, attachmentId)
      .then(async (res) => {
        if (res?.code === 0 && res?.data) {
          const { url, fileName } = res.data;
          if (!url) {
            Toast.info({ content: '获取下载链接失败' });
          }

          await callback(url, fileName);
        } else {
          Toast.info({ content: res?.msg });
        }
      })
      .catch((error) => {
        Toast.info({ content: '获取下载链接失败' });
        console.error(error);
        return;
      })
      .finally(() => {
        // toastInstance?.destroy();
      });
  };

  const [downloading, setDownloading] = useState(Array.from({ length: showAttachList.length }, () => false));

  const onDownLoad = async (item, index) => {
    updateViewCount();

    if (!canDownloadAttachment) {
      Toast.warning({ content: '暂⽆权限下载附件' });
      return;
    }

    if (!item || !threadId) return;
    const params = downloadAttachmentParams(item);
    const isDownload = await downloadAttachment(params);
    if (!isDownload) return;

    // 下载中
    if (downloading?.length && downloading[index]) {
      Toast.info({ content: '下载中，请稍后' });
      return;
    }

    if (!item || !threadId) return;

    if (!item?.url) {
      Toast.info({ content: '获取下载链接失败' });
      // downloading[index] = false;
      // setDownloading([...downloading]);
      return;
    }

    if (!item?.url) {
      Toast.info({ content: '获取下载链接失败' });
      // downloading[index] = false;
      // setDownloading([...downloading]);
    }

    Taro.downloadFile({
      url: item.url,
      success(res) {
        Taro.openDocument({
          filePath: res.tempFilePath,
          success(res) {
            Toast.info({ content: '下载成功' });
          },
          fail(error) {
            Toast.info({ content: '小程序暂不支持下载此类文件，请点击“链接”复制下载链接' });
            console.error(error.errMsg);
          },
          complete() { },
        });
      },
      fail(error) {
        if (error?.errMsg.indexOf('domain list') !== -1) {
          Toast.info({ content: '下载链接不在域名列表中' });
        } else if (error?.errMsg.indexOf('invalid url') !== -1) {
          Toast.info({ content: '下载链接无效' });
        } else {
          Toast.info({ content: error.errMsg });
        }
        console.error(error.errMsg);
      },
      complete() {
        // downloading[index] = false;
        // setDownloading([...downloading]);
      },
    });
  };

  const downloadAttachmentParams = (item) => {
    const params = {
      threadId,
      attachmentsId: item.id,
    };
    return params;
  };

  const downloadAttachment = async (params) => {
    const res = await readDownloadAttachment(params);

    if (res?.code === 0) {
      // 弹出下载弹框
      return true;
    }

    Toast.info({ content: res?.msg });

    return false;
  };

  const onLinkShare = (item, index) => {
    updateViewCount();
    if (!canViewAttachment) {
      Toast.warning({ content: '暂⽆权限查看附件' });
      return;
    }
    if (!item || !threadId) return;

    const attachmentId = item.id;
    fetchDownloadUrl(threadId, attachmentId, (url, fileName) => {
      // 链接拼接
      url = splicingLink(url, fileName);

      Taro.setClipboardData({
        data: url,
        success(res) {
          Taro.getClipboardData({
            success(res) { },
          });
        },
      });
    });
  };

  const splicingLink = (url, fileName) => {
    const domainName = url.split('/api/v3/')[0];
    return `${domainName}/download?url=${url}&threadId=${threadId}`;
  };

  // 音频播放
  const isAttachPlayable = (file) => (showPlayStatus && AUDIO_FORMAT.includes(file?.extension?.toUpperCase()));

  const beforeAttachPlay = async (file) => {
    // 该文件已经通过校验，能直接播放
    if (file.readyToPlay) {
      return true;
    }

    if (!file || !threadId) return;

    await fetchDownloadUrl(threadId, file.id, () => {
      file.readyToPlay = true;
    });

    return !!file.readyToPlay;
  };

  const onPlay = (audioRef, audioWrapperRef) => {
    const audioContext = audioRef?.current?.getState()?.audioCtx;
    updateViewCount();
    if (audioContext && baselayout && audioWrapperRef) {
      // 暂停之前正在播放的视频
      if (baselayout.playingVideoDom) {
        Taro.createVideoContext(baselayout.playingVideoDom)?.pause();
      }

      // 暂停之前正在播放的音频
      if (baselayout.playingAudioDom) {
        if (baselayout.playingAudioWrapperId !== audioWrapperRef.current.uid) {
          baselayout.playingAudioDom?.pause();
          baselayout.playingAudioWrapperId = audioWrapperRef.current.uid;
        }
      }

      baselayout.playingAudioDom = audioContext;
      baselayout.playingAudioWrapperId = audioWrapperRef.current.uid;
    }
  };

  const audioRef = useRef();
  const audioWrapperRef = useRef();

  const renderRightArea = ({ item, index }) => {
    if (customActionArea) {
      return customActionArea({ item, index });
    }

    return (
      <>
        <Text onClick={unifyOnClick || throttle(() => onLinkShare(item), 1000)}>链接</Text>
        <View className={styles.label}>
          {downloading[index] ? (
            <Spin className={styles.spinner} type="spinner" />
          ) : (
            <Text onClick={unifyOnClick || throttle(() => onDownLoad(item, index), 1000)}>下载</Text>
          )}
        </View>
      </>
    );
  };

  const renderNormal = ({ item, index, type }) => {
    if (isAttachPlayable(item)) {
      const { url, fileName, fileSize } = item;
      return (
        <View className={styles.audioContainer} key={index} onClick={onClick} ref={audioWrapperRef}>
          <AudioPlayer
            ref={audioRef}
            src={url}
            fileName={fileName}
            onPlay={() => onPlay(audioRef, audioWrapperRef)}
            fileSize={handleFileSize(parseFloat(item.fileSize || 0))}
            beforePlay={unifyOnClick || (async () => await beforeAttachPlay(item))}
            onDownload={unifyOnClick || throttle(() => onDownLoad(item, index), 1000)}
            onLink={unifyOnClick || throttle(() => onLinkShare(item), 1000)}
          />
        </View>
      );
    }

    return (
      <View className={styles.container} key={index} onClick={onClick}>
        <View className={styles.wrapper}>
          <View className={styles.left}>
            <Image src={getAttachmentIconLink(type)} className={styles.containerIcon} mode="widthfix" />
            <View className={styles.containerText}>
              <Text className={styles.content}>{item.fileName}</Text>
              <Text className={styles.size}>{handleFileSize(parseFloat(item.fileSize || 0))}</Text>
            </View>
          </View>

          <View className={styles.right}>{renderRightArea({ item, index })}</View>
        </View>
      </View>
    );
  };

  const Pay = ({ item, index, type }) => (
    <View className={`${styles.container} ${styles.containerPay}`} key={index} onClick={onPay}>
      <Image src={getAttachmentIconLink(type)} className={styles.containerIcon} mode="widthfix" />
      <Text className={styles.content}>{item.fileName}</Text>
    </View>
  );

  // 是否展示 查看更多
  const [isShowMore, setIsShowMore] = useState(false);

  useEffect(() => {
    // 详情页不折叠
    const { path } = Taro.getCurrentInstance().router;
    if (~path.indexOf('/indexPages/thread/index')) {
      setIsShowMore(false);
    } else {
      setIsShowMore(showAttachList.length > ATTACHMENT_FOLD_COUNT);
    }
  }, []);

  const clickMore = () => {
    setIsShowMore(false);
  };

  return (
    <View className={styles.wrapper}>
      {showAttachList.map((item, index) => {
        if (isShowMore && index >= ATTACHMENT_FOLD_COUNT) {
          return null;
        }

        // 获取文件类型
        const extension = item?.extension || '';
        const type = extensionList.indexOf(extension.toUpperCase()) > 0 ? extension.toUpperCase() : 'UNKNOWN';

        return renderNormal({ item, index, type });
      })}
      {isShowMore ? (
        <View className={styles.loadMore} onClick={clickMore}>
          查看更多
          <Icon name="RightOutlined" className={styles.icon} size={12} />
        </View>
      ) : (
        <></>
      )}
    </View>
  );
};

export default inject('user', 'baselayout', 'thread')(observer(Index));
