import React from 'react';
import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import Upload from '@discuzqsdk/design/dist/components/upload/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import locals from '@common/utils/local-bridge';
import constants from '@common/constants';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import ProgressRender from './progress-render';
import styles from './index.module.scss';

function DzqUpload(props) {
  const {
    listType,
    fileList,
    btnText,
    isCustomUploadIcon,
    limit,
    children,
    onRemove,
    beforeUpload,
    onChange,
    onSuccess,
    onFail,
    onComplete,
    data,
    accept,
    className,
  } = props;
  const multiple = limit > 1;

  const post = async (file, list, updater) => {
    const ret = await createAttachment(file, (progressEvent) => {
      const { progress } = progressEvent;
      // progressEvent
      file.status = 'uploading';
      file.percent = progress === 100 ? 99 : progress;
      updater(list);
    });

    if (ret.code === 0) {
      file.status = 'success';
      updater(list);
      onSuccess(ret, file);
      onComplete(ret, file, list);
    } else {
      file.status = 'error';
      updater(list);
      onFail(ret, file);
      onComplete(ret, file, list);
      return false;
    }
    return ret;
  };

  // 上传附件
  const createAttachment = (file, progress) => new Promise((resolve, reject) => {
      const tempFilePath = file.path || file.tempFilePath;
      const token = locals.get(constants.ACCESS_TOKEN_NAME);
      const { COMMON_BASE_URL = '' } = props?.site?.envConfig;
      const uploadTask = Taro.uploadFile({
        url: `${COMMON_BASE_URL}/api/v3/attachments`,
        filePath: tempFilePath,
        name: 'file',
        header: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${token}`,
        },
        formData: {
          ...data,
        },
        success(res) {
          const response = JSON.parse(res.data);
          if (response) {
            response.code = response.Code;
            response.data = response.Data;
          }
          resolve(response);
        },
        fail(res) {
          reject(res);
        },
      });

      uploadTask.progress((res) => {
        progress(res);
      });
    });

  // TODO: 因为上传组件不支持传class和style，所以在外面增加了一层dom
  const clsName = isCustomUploadIcon
    ? `${styles['dzq-custom-upload']} ${styles['dzq-upload-reset']} ${className}`
    : `${styles['dzq-upload-reset']}  ${className}`;

  return (
    <View className={clsName}>
      <Upload
        // progressRender={(file) => <ProgressRender file={file} />}
        listType={listType}
        fileList={fileList}
        limit={limit}
        multiple={multiple}
        onRemove={(file) => {
          onRemove(file);
        }}
        beforeUpload={(cloneList, showFileList) => {
          if (typeof beforeUpload !== 'function') return true;
          return beforeUpload(cloneList, showFileList);
        }}
        onChange={(fileList) => {
          onChange(fileList);
        }}
        customRequest={post}
        accept={accept}
      >
        {!isCustomUploadIcon && (
          <View type="text" className={classNames(styles['flex-column-center'], styles['text-grey'])}>
            <Icon name="PlusOutlined" size={16}></Icon>
            <Text className="dzq-upload__btntext">{btnText}</Text>
          </View>
        )}
        {isCustomUploadIcon && children}
      </Upload>
    </View>
  );
}

DzqUpload.options = {
  addGlobalClass: true,
};

/**
 * 添加附件可以用 listType = list 的类型
 * 图片可以使用 listType = card 的类型
 */
DzqUpload.defaultProps = {
  data: {
    type: 1, // 默认传的是图片类型
  }, // 上传要附加的数据
  listType: 'list', // 显示类型
  fileList: [], // 展示的文件
  btnText: '', // 显示的上传按钮的文案
  limit: 1, // 上传限制的个数
  accept: '', // 上传允许的类型
  isCustomUploadIcon: false, // 是否自定义上传按钮
  onRemove: () => {},
  beforeUpload: () => {},
  onChange: () => {},
  onSuccess: () => {},
  onFail: () => {},
  onComplete: () => {},
};

export default inject('site')(observer(DzqUpload));
