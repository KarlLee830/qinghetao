
/**
 * 通用上传组件、支持图片、附件、录音等的上传和展示
 */
import React from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View } from '@tarojs/components';
import AudioRecord from '@discuzqsdk/design/dist/components/audio-record/index';
import Audio from '@discuzqsdk/design/dist/components/audio/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import { Units } from '@components/common';
import styles from './index.module.scss';
import { THREAD_TYPE } from '@common/constants/thread-post';
import commonUpload from '@common/utils/common-upload';

export default inject('threadPost', 'site')(observer(({ type, threadPost, site, audioUpload, children, pageScrollTo }) => {
  const { postData, setPostData } = threadPost;
  const { webConfig = {}, envConfig, attachmentLimit = 9 } = site;
  const { setAttach, qcloud } = webConfig;
  const { supportImgExt, supportMaxSize } = setAttach;
  const { qcloudCosBucketName, qcloudCosBucketArea, qcloudCosSignUrl, qcloudCos } = qcloud;
  const localData = JSON.parse(JSON.stringify(postData));

  const { images, files, audio } = localData;

  // 检查选中附件、图片的合法性，合法则可以上传
  const checkWithUpload = async (cloneList, isImage = true) => {
    Taro.showLoading({ title: '上传中', mask: true });

    let isAllLegal = true; // 状态：此次上传图片是否全部合法
    // const uploadPromise = [];
    const { supportFileExt, supportImgExt, supportMaxSize } = webConfig?.setAttach;
    const supportExt = isImage ? supportImgExt : supportFileExt; // 支持的文件格式
    const showList = isImage ? images : files; // 已上传文件列表
    const limit = isImage ? 9 : attachmentLimit;
    const remainLength = limit - Object.keys(showList).length; // 剩余可传数量



    let photoMaxSize = supportMaxSize;
    if (isImage && qcloudCos) {
      photoMaxSize = supportMaxSize > 15 ? 15 : supportMaxSize;
    }

    // 1 删除多余文件
    cloneList.splice(remainLength, cloneList.length - remainLength);

    // 2 校验文件合法性
    for (let i = 0; i < cloneList.length; i++) {
      const fileType = cloneList[i].path.match(/\.([^\.]+)$/)[1].toLocaleLowerCase();
      const fileSize = cloneList[i].size;
      const isLegalType = supportExt.toLocaleLowerCase().includes(fileType);
      const isLegalSize = fileSize > 0 && fileSize < supportMaxSize * 1024 * 1024;

      if (!(isLegalType && isLegalSize)) {
        cloneList.splice(i, 1);
        i--;
        isAllLegal = false;
      }
    }

    // 3 开始进行上传
    const type = isImage ? 1 : 0;
    let res = [];
    try {
      res = await commonUpload({
        files: cloneList,
        type,
        qcloudCos,
        qcloudCosBucketName,
        qcloudCosBucketArea,
        qcloudCosSignUrl,
        supportImgExt,
        supportMaxSize,
        host: envConfig.COMMON_BASE_URL
      });
    } catch (error) {
      Taro.hideLoading();
    }

    Taro.hideLoading();
    pageScrollTo({ selector: isImage ? "#thread-post-image" : "#thread-post-file" });
    let count = 0;
    res.forEach((item) => {
      const { code, data } = item;
      if (code === 0) {

        if (isImage) {
          images[data.id] = {
            ...data,
          };
          setPostData({ images });
        } else {
          files[data.id] = {
            name: data.fileName,
            size: data.fileSize,
            ...data,
          };
          setPostData({ files });
        }
      } else {
        count++;
      }
    });

    if (count > 0 && isAllLegal) {
      Toast.error({
        content: `${count} ${isImage ? '张照片' : '个文件'}上传失败`,
      });
    }

    if (!isAllLegal) {
      Toast.error({
        content: `仅支持${supportExt}格式，且0~${photoMaxSize}MB的${isImage ? '图片' : '文件'}`,
      });
    }

  }

  // 选择图片
  const chooseImage = () => {
    Taro.chooseImage({
      count: 9,
      success(res) {
        checkWithUpload(res.tempFiles)
      }
    });
  }

  // 选择附件
  const chooseFile = () => {
    Taro.chooseMessageFile({
      count: attachmentLimit,
      type: 'file',
      success(res) {
        checkWithUpload(res.tempFiles, false)
      }
    });
  }

  // 进行附件上传
  const atta = (
    <>
      {Object.values(files).map((item, index) => {
        return (
          <Units key={index} type='atta' filename={item.name} size={item.size ? `${Math.ceil(item.size / 1024)}KB` : ''} onDelete={() => {
            delete files[item.id];
            setPostData({ files });
          }} />
        );
      })}

      <View id='thread-post-file'>
        {(type === THREAD_TYPE.file && Object.values(files).length < attachmentLimit) && (<Units type='atta-upload' onUpload={chooseFile} />)}
      </View>
    </>
  );

  // 进行图片上传
  const img = (
    <View className={styles['img-container']}>
      {Object.values(images).map((item, index) => {
        const className = (index % 2 === 0) ? styles['margin'] : '';
        return (
          <Units className={className} type='img' src={item.thumbUrl} onDelete={() => {
            delete images[item.id];
            setPostData({ images });
          }} />
        );
      })}

      <View id='thread-post-image'>
        {(type === THREAD_TYPE.image && Object.values(images).length < 9) && (<Units type='img-upload' onUpload={chooseImage} />)}
      </View>
    </View>
  );

  // 录音并上传
  const audioRecord = (
    <View id="thread-post-voice">
      {(type === THREAD_TYPE.voice && !audio.id) && (
        <AudioRecord
          duration={60.4}
          onUpload={(file) => {
            audioUpload(file);
          }}
          onRecordBegan={() => {
            setPostData({ audioRecordStatus: 'began' });
          }}
          onRecordCompleted={() => {
            setPostData({ audioRecordStatus: 'completed' });
          }}
          onRecordReset={() => {
            setPostData({ audioRecordStatus: 'reset' });
          }}
        />)
      }
    </View>
  );

  // 录音音频
  const audioPlayer = (audio?.mediaUrl) && (
    <View className={styles['audio-container']}>
      <Audio src={audio.mediaUrl} onDelete={() => { setPostData({ audio: {} }); }} />
    </View>
  );


  return (
    <>
      {img}
      {children}
      {audioRecord}
      {audioPlayer}
      {atta}
    </>
  );
}));
