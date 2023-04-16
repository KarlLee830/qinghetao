import React, { useState, useRef, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { Icon, Toast, Spin, AudioPlayer } from '@discuzqsdk/design';
import { extensionList, isPromise, noop } from '../utils';
import { throttle } from '@common/utils/throttle-debounce.js';
import h5Share from '@discuzqsdk/sdk/dist/common_modules/share/h5';
import isWeiXin from '@common/utils/is-weixin';
import { FILE_PREVIEW_FORMAT, AUDIO_FORMAT } from '@common/constants/thread-post';
import FilePreview from './../file-preview';
import getAttachmentIconLink from '@common/utils/get-attachment-icon-link';
import { ATTACHMENT_FOLD_COUNT } from '@common/constants';
import { get } from '@common/utils/get';
import { readDownloadAttachment } from '@server';
import goToLoginPage from '@common/utils/go-to-login-page';

import styles from './index.module.scss';
import Router from '@discuzqsdk/sdk/dist/router';

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
  threadId = null,
  thread = null,
  user = null,
  site = null,
  updateViewCount = noop,
  unifyOnClick = null,
  canDownloadAttachment = false,
  canViewAttachment = false,
  isShowShowMore = true,
  customActionArea = null,
  showPlayStatus = true, // 音频附件是否展示为播放状态，false：当作文本附件展示
}) => {
  let itemUrl = null;
  // 过滤需要部分付费的附件
  const showAttachList = attachments.filter(
    item => item.needPay === undefined ? !isPay : item.needPay !== 1
  );

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

    let toastInstance = Toast.loading({
      duration: 0,
    });

    await thread
      .fetchThreadAttachmentUrl(threadId, attachmentId)
      .then((res) => {
        if (res?.code === 0 && res?.data) {
          const { url, fileName } = res.data;
          if (!url) {
            Toast.info({ content: '获取下载链接失败' });
          }
          callback(url, fileName);
        } else {
          if (res?.msg || res?.Message) Toast.info({ content: res?.msg || res?.Message });
        }
      })
      .catch((error) => {
        Toast.info({ content: '获取下载链接失败' });
        console.error(error);
        return;
      })
      .finally(() => {
        toastInstance?.destroy();
      });
  };

  const [downloading, setDownloading] = useState(Array.from({ length: showAttachList.length }, () => false));

  const onDownLoad = (item, index) => {
    updateViewCount();

    if (!canDownloadAttachment) {
      Toast.warning({ content: '暂⽆权限下载附件' });
      return;
    }

    itemUrl = item.url; // 暂用于微信下载

    if (!item || !threadId) return;
    download(item);
  };

  const download = async (item) => {
    const params = downloadAttachmentParams(item);
    if (params) {
      const isDownload = await downloadAttachment(params);
      if (isDownload) {
        Toast.info({ content: '正在下载' });
        window.location.href = itemUrl;
      }
    }
  };

  const downloadAttachmentParams = (item) => {
    const params = {
      attachmentsId: item.id,
      threadId: threadId,
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

  const onLinkShare = (item, e) => {
    updateViewCount();
    if (!canViewAttachment) {
      Toast.warning({ content: '暂⽆权限查看附件' });
      return;
    }
    if (!item || !threadId) return;

    const attachmentId = item.id;
    fetchDownloadUrl(threadId, attachmentId, async (url, fileName) => {
      // 链接拼接
      url = splicingLink(url, fileName);

      setTimeout(() => {
        if (!h5Share({ url: url })) {
          navigator.clipboard.writeText(url); // qq浏览器不支持异步document.execCommand('Copy')
        }
        Toast.success({
          content: '链接复制成功',
        });
      }, 300);
    });
  };

  const splicingLink = (url, fileName) => {
    const host = window.location.host; // 域名
    const protocol = window.location.protocol; // 协议
    return `${protocol}//${host}/download?url=${url}&threadId=${threadId}`;
  };

  // 文件是否可预览
  const isAttachPreviewable = (file) => {
    const qcloudCosDocPreview = get(site, 'webConfig.qcloud.qcloudCosDocPreview', false);
    return qcloudCosDocPreview && FILE_PREVIEW_FORMAT.includes(file?.extension?.toUpperCase());
  };

  // 附件预览
  const [previewFile, setPreviewFile] = useState(null);
  const onAttachPreview = (file) => {
    updateViewCount();
    if (!canViewAttachment) {
      Toast.warning({ content: '暂⽆权限查看附件' });
      return;
    }

    if (!file || !threadId) return;

    fetchDownloadUrl(threadId, file.id, () => {
      // 校验权限
      setPreviewFile(file);
    });
  };

  // 音频播放
  const isAttachPlayable = (file) => {
    return showPlayStatus && AUDIO_FORMAT.includes(file?.extension?.toUpperCase());
  };

  const beforeAttachPlay = async (file) => {
    // 该文件已经通过校验，能直接播放
    if (file.readyToPlay) {
      return true;
    }

    // 播放前校验权限
    updateViewCount();
    if (!file || !threadId) return;

    await fetchDownloadUrl(threadId, file.id, () => {
      file.readyToPlay = true;
    });

    return !!file.readyToPlay;
  }

  const renderRightArea = ({ item, index }) => {
    if (customActionArea) {
      return customActionArea({ item, index });
    }

    return (
      <>
        {isAttachPreviewable(item) ? (
          <span onClick={unifyOnClick || throttle(() => onAttachPreview(item), 1000)}>预览</span>
        ) : (
          <></>
        )}
        <span className={styles.span} onClick={unifyOnClick || throttle(() => onLinkShare(item), 1000)}>
          链接
        </span>
        <div className={styles.label}>
          {downloading[index] ? (
            <Spin className={styles.spinner} type="spinner" />
          ) : (
            <span className={styles.span} onClick={unifyOnClick || throttle(() => onDownLoad(item, index), 1000)}>
              下载
            </span>
          )}
        </div>
      </>
    );
  };

  const renderNormal = ({ item, index, type }) => {
    if (isAttachPlayable(item)) {
      const { url, fileName, fileSize } = item;

      return (
        <div className={styles.audioContainer} key={index} onClick={onClick}>
          <AudioPlayer
            src={url}
            fileName={fileName}
            fileSize={handleFileSize(parseFloat(item.fileSize || 0))}
            beforePlay={unifyOnClick || (async () => await beforeAttachPlay(item))}
            onDownload={unifyOnClick || throttle(() => onDownLoad(item, index), 1000)}
            onLink={unifyOnClick || throttle(() => onLinkShare(item), 1000)}
          />
        </div>
      );
    }

    return (
      <div className={styles.container} key={index} onClick={onClick}>
        <div className={styles.wrapper}>
          <div className={styles.left}>
            <img alt="图片" className={styles.containerIcon} src={getAttachmentIconLink(type)} />
            <div className={styles.containerText}>
              <span className={styles.content}>{item.fileName}</span>
              <span className={styles.size}>{handleFileSize(parseFloat(item.fileSize || 0))}</span>
            </div>
          </div>

          <div className={styles.right}>{renderRightArea({ item, index, type })}</div>
        </div>
      </div>
    );
  };

  const Pay = ({ item, index, type }) => {
    return (
      <div className={`${styles.container} ${styles.containerPay}`} key={index} onClick={onPay}>
        <img className={styles.containerIcon} src={getAttachmentIconLink(type)} />
        <span className={styles.content}>{item.fileName}</span>
      </div>
    );
  };

  // 是否展示 查看更多
  const [isShowMore, setIsShowMore] = useState(false);
  useEffect(() => {
    // 详情页不折叠
    const { pathname } = window.location;
    if (!isShowShowMore) {
      setIsShowMore(false);
      return;
    }
    if (/^\/thread\/\d+/.test(pathname)) {
      setIsShowMore(false);
    } else {
      setIsShowMore(showAttachList.length > ATTACHMENT_FOLD_COUNT);
    }
  }, []);
  const clickMore = () => {
    setIsShowMore(false);
  };

  return (
    <div className={styles.wrapper}>
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
        <div className={styles.loadMore} onClick={clickMore}>
          查看更多
          <Icon name="RightOutlined" className={styles.icon} size={12} />
        </div>
      ) : (
        <></>
      )}
      {previewFile ? <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} /> : <></>}
    </div>
  );
};

export default inject('thread', 'user', 'site')(observer(Index));
