import React from 'react';
import Upload from '@components/upload';
import { ATTACHMENT_TYPE, ACCEPT_FILE_TYPES } from '@common/constants/thread-post';

export default function FileUpload(props) {
  const { onChange, onComplete, fileList, limit = 9, className, ...other } = props;
  const data = { type: ATTACHMENT_TYPE.file };
  return <Upload
    className={`dzq-post-file-upload ${className}`}
    listType="list"
    btnText="添加附件"
    data={data}
    limit={limit}
    // accept={ACCEPT_FILE_TYPES.join(',')}
    onChange={onChange}
    onComplete={onComplete}
    fileList={fileList}
    {...other}
  />;
}
