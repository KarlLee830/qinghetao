// 使用attachment接口上传
import { createAttachment } from '@common/server';

const attachmentApiUpload =  options => {
  const { file, type } = options;

  const formData = new FormData();
  formData.append('type', type);

  if (typeof file === 'string') {
    formData.append('fileUrl', file);
  } else {
    formData.append('file', file);
  }

  return createAttachment(formData);
};

export default attachmentApiUpload;