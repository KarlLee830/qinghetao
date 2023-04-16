import React from 'react';
import Upload from '@components/upload';
import { ATTACHMENT_TYPE } from '@common/constants/thread-post';

export default function ImageUpload(props) {
  const { onChange, onComplete, fileList, className, ...other } = props;
  const data = { type: ATTACHMENT_TYPE.image };
  return <Upload
    className={`dzq-post-image-upload ${className}`}
    listType="card"
    btnText="上传图片"
    data={data}
    limit={9}
    accept='image'
    onChange={onChange}
    onComplete={onComplete}
    fileList={fileList}
    {...other}
  />;
}
