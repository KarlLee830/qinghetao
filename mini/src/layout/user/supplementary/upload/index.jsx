/**
 * 通用上传组件、支持图片、附件、录音等的上传和展示
 */
import React from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View } from '@tarojs/components';
// import AudioRecord from '@discuzqsdk/design/dist/components/audio-record/index';
// import Audio from '@discuzqsdk/design/dist/components/audio/index';
import { Units } from '@components/common';
import locals from '@common/utils/local-bridge';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import constants from '@common/constants';
import { THREAD_TYPE } from '@common/constants/thread-post';
import styles from './index.module.scss';

// @TODO 基于@components/thread-post/general-upload组件修改
// 待重构提取公用
export default inject('site')(
  observer(({ type, attachList, onUpload, onDelete, site, config = {}, audioUpload }) => {
    const { webConfig, envConfig } = site;

    typeof onUpload !== 'function' && (onUpload = () => {});
    typeof onDelete !== 'function' && (onDelete = () => {});

    const localData = JSON.parse(JSON.stringify(attachList || []));

    // 检查选中附件、图片的合法性，合法则可以上传
    const checkWithUpload = async (tempFiles, type) => {
      // 站点支持的附件类型、图片类型、尺寸大小
      const { supportFileExt, supportImgExt, supportMaxSize } = webConfig?.setAttach;

      if (type === THREAD_TYPE.file) {
        const tempFile = tempFiles[0]; // 附件上传一次只能传一个
        const fileType = tempFile.name.match(/\.([^\.]+)$/)[1].toLocaleLowerCase();
        const fileSize = tempFile.size;
        const isLegalType = supportFileExt.toLocaleLowerCase().includes(fileType);
        const isLegalSize = supportMaxSize * 1024 * 1024 > fileSize;

        if (!isLegalType) {
          Taro.showToast({ title: `仅支持${supportFileExt}格式的附件`, icon: 'none' });
          return;
        }
        if (!isLegalSize) {
          Taro.showToast({ title: `仅支持0 ~ ${supportMaxSize}MB的附件`, icon: 'none' });
          return;
        }
        Taro.showLoading({
          title: '上传中',
          mask: true,
        });
        try{
          await upload(tempFile);
        }catch(err){
          Toast.error({
            content: err.Msg || '上传失败',
            hasMask: false,
            duration: 1000,
          });
        }
        Taro.hideLoading();
      } else if (type === THREAD_TYPE.image) {
        // 剔除超出数量9的多余图片
        const remainLength = 9 - localData.length; // 剩余可传数量
        tempFiles.splice(remainLength, tempFiles.length - remainLength);

        let isAllLegal = true; // 状态：此次上传图片是否全部合法
        const uploadPromise = [];
        tempFiles.forEach((item, index) => {
          const imageType = item.path.match(/\.([^\.]+)$/)[1].toLocaleLowerCase();
          const imageSize = item.size;
          const isLegalType = supportImgExt.toLocaleLowerCase().includes(imageType);
          const isLegalSize = supportMaxSize * 1024 * 1024 > imageSize;

          // 存在不合法图片时，从上传图片列表删除
          if (!isLegalType || !isLegalSize) {
            tempFiles.splice(index, 1);
            isAllLegal = false;
            return;
          }
          Taro.showLoading({
            title: '上传中',
            mask: true,
          });
          uploadPromise.push(upload(item));
        });
        try{
          await Promise.all(uploadPromise);
        }catch(err){
          Toast.error({
            content: err.Msg || '上传失败',
            hasMask: false,
            duration: 1000,
          });
        }
        Taro.hideLoading();
        !isAllLegal &&
          Taro.showToast({
            title: `仅支持${supportImgExt}格式，且0~${supportMaxSize}MB的图片`,
            icon: 'none',
          });
      }

      return true;
    };

    // 执行上传
    const upload = (file) => {
      return new Promise((resolve, reject) => {
        const tempFilePath = file.path || file.tempFilePath;
        const token = locals.get(constants.ACCESS_TOKEN_NAME);
        Taro.uploadFile({
          url: `${envConfig.COMMON_BASE_URL}/api/v3/attachments`,
          filePath: tempFilePath,
          name: 'file',
          header: {
            'Content-Type': 'multipart/form-data',
            authorization: `Bearer ${token}`,
          },
          formData: {
            type: (() => {
              switch (type) {
                case THREAD_TYPE.image:
                  return 1;
                case THREAD_TYPE.file:
                  return 0;
              }
            })(),
          },
          success(res) {
            const data = JSON.parse(res.data).Data;
            switch (type) {
              case THREAD_TYPE.image:
                const imageObj = {
                  thumbUrl: tempFilePath,
                  ...data,
                };
                localData.push(imageObj);
                onUpload(localData, imageObj);
                break;
              case THREAD_TYPE.file:
                const fileObj = {
                  thumbUrl: tempFilePath,
                  name: file.name,
                  size: file.size,
                  ...data,
                };
                localData.push(fileObj);
                onUpload(localData, fileObj);
                break;
            }
            resolve();
          },
          fail(res) {
            reject(res);
          },
        });
      });
    };

    // 选择图片
    const chooseImage = () => {
      Taro.chooseImage({
        count: 9,
        success(res) {
          checkWithUpload(res.tempFiles, THREAD_TYPE.image);
        },
      });
    };

    // 选择附件
    const chooseFile = () => {
      Taro.chooseMessageFile({
        count: 1,
        success(res) {
          checkWithUpload(res.tempFiles, THREAD_TYPE.file);
        },
        error(err) {
          console.log(555, err);
        },
      });
    };

    // todo：上传和文件列表分开展示的场景
    // 仅上传
    const attaUpload = (
      <View className={styles['atta-upload']}>
        {type === THREAD_TYPE.file && (
          <Units type="atta-upload" onUpload={chooseFile} icon="PaperClipOutlined" label={config.label} />
        )}
      </View>
    );
    // 仅显示文件列表
    const attaList = (
      <View className={styles['atta-list']}>
        {localData.map((item, index) => {
          return (
            <Units
              key={index}
              type="atta"
              filename={item.name}
              size={`${Math.ceil(item.size / 1024)}KB`}
              onDelete={() => {
                const deletedData = localData.splice(index, 1);
                onDelete(localData, deletedData);
              }}
            />
          );
        })}
      </View>
    );
    // 进行附件上传（上传 + 文件列表）
    const atta = (
      <>
        {attaList}
        {attaUpload}
      </>
    );
    const renderAtta = () => {
      let render = atta;
      config.uploadOnly && (render = attaUpload);
      config.listOnly && (render = attaList);

      return render;
    };

    // 进行图片上传
    const img = (
      <View className={styles['img-container']}>
        {localData.map((item, index) => {
          const className = index % 2 === 0 ? styles['margin'] : '';
          return (
            <Units
              className={config?.className}
              type="img"
              src={item.thumbUrl}
              onDelete={() => {
                const deletedData = localData.splice(index, 1);
                onDelete(localData, deletedData);
              }}
            />
          );
        })}

        {type === THREAD_TYPE.image && localData.length < 9 && (
          <Units type="img-upload" onUpload={chooseImage} label={config.label} />
        )}
      </View>
    );
    const renderImg = () => {
      return img;
    };

    // 录音并上传
    // const audioRecord = (type === THREAD_TYPE.voice && !audio.id) && (
    //   <AudioRecord duration={60} onUpload={(file) => { audioUpload(file) }} />
    // );

    // 录音音频
    // const audioPlayer = (audio.id) && (
    //   <Audio src={audio.mediaUrl} onDelete={() => { onUpload({}) }} />
    // );

    switch (type) {
      case THREAD_TYPE.file:
        return renderAtta();
      case THREAD_TYPE.image:
        return renderImg();
      default:
        return <></>;
    }
  }),
);
