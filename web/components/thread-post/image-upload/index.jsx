import React from 'react';
import Upload from '@components/upload';
import { ATTACHMENT_TYPE, ACCEPT_IMAGE_TYPES } from '@common/constants/thread-post';
import wxChooseImage from '@common/utils/wx-choose-image';

export default function ImageUpload(props) {
  const { onChange, onComplete, fileList, className, ...other } = props;
  const data = { type: ATTACHMENT_TYPE.image };
  return <Upload
    className={`dzq-post-image-upload ${className}`}
    listType="card"
    btnText="上传图片"
    data={data}
    limit={9}
    wxChooseImage={wxChooseImage}
    accept={ACCEPT_IMAGE_TYPES.join(',')}
    onChange={onChange}
    onComplete={onComplete}
    fileList={fileList}
    {...other}
  />;
}
