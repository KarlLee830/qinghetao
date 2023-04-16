import React from 'react';
import { Upload, Button, Icon } from '@discuzqsdk/design';
import { createAttachment } from '@common/server';
import styles from './index.module.scss';
import classNames from 'classnames';
import ProgressRender from './progress-render';
import { fixImageOrientation } from '@common/utils/exif';
import commonUpload from '@common/utils/common-upload';


export default function DzqUpload(props) {
  const {
    cosOptions,
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
    wxChooseImage = () => new Promise(resolve => resolve([])),
  } = props;
  const type = data.type;
  const multiple = limit > 1;
  const post = async (file, list, updater) => {
    const fileImg = await fixImageOrientation(file.originFileObj);
    if (cosOptions) {
      file.status = 'uploading';
      updater(list);
      const response = await commonUpload({
        files: [fileImg],
        type,
        ...cosOptions,
      });
      const res = response[0];
      const { code, data } = res;
      if (code === 0) {
        file.status = 'success';
        updater(list);
        onSuccess({ ...res, type: file.type }, file);
        onComplete({ ...res, type: file.type }, file, list);
      } else {
        file.status = 'error';
        updater(list);
        onFail(res, file);
        onComplete(res, file, list);
        return false;
      }
      return { ...res, type: file.type };

    } else {
      // file, list, updater
      const formData = new FormData();
      formData.append('file', fileImg);
      Object.keys(data).forEach((item) => {
        formData.append(item, data[item]);
      });
      // TODO:进度条目前有问题
      const ret = await createAttachment(formData, (progressEvent) => {
        // progressEvent
        const complete = ((progressEvent.loaded / progressEvent.total) * 100) | 0;
        file.status = 'uploading';
        file.percent = complete === 100 ? 99 : complete;
        updater(list);
      });
      if (ret.code === 0) {
        file.status = 'success';
        updater(list);
        onSuccess({ ...ret, type: file.type }, file);
        onComplete({ ...ret, type: file.type }, file, list);
      } else {
        file.status = 'error';
        updater(list);
        onFail(ret, file);
        onComplete(ret, file, list);
        return false;
      }
      return { ...ret, type: file.type };
    }
  };

  // TODO: 因为上传组件不支持传class和style，所以在外面增加了一层dom
  const clsName = isCustomUploadIcon
    ? `${styles['dzq-custom-upload']} ${styles['dzq-upload-reset']} ${className}`
    : `${styles['dzq-upload-reset']}  ${className}`;
  const formatFileList = (fileList || []).map((item) => {
    const type = item?.fileType?.toString() || item?.type?.toString();
    const size = item?.fileSize || item?.size;
    return { ...item, type, size };
  });
  return (
    <div className={clsName} onClick={(e) => e.stopPropagation()}>
      <Upload
        // progressRender={(file) => <ProgressRender file={file} />}
        listType={listType}
        fileList={formatFileList}
        limit={limit}
        multiple={multiple}
        onRemove={(file) => {
          onRemove(file);
        }}
        wxChooseImage={wxChooseImage}
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
          <Button type="text" className={classNames(styles['flex-column-center'], styles['text-grey'])}>
            <Icon name="PlusOutlined" size={16}></Icon>
            <span className="dzq-upload__btntext">{btnText}</span>
          </Button>
        )}
        {isCustomUploadIcon && children}
      </Upload>
    </div>
  );
}

/**
 * 添加附件可以用 listType = list 的类型
 * 图片可以使用 listType = card 的类型
 */
DzqUpload.defaultProps = {
  data: {
    type: 1, // 默认传的是图片类型
  }, // 上传要附加的数据
  cosOptions: null,
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
