let attachmentApiUpload = () => {};

if (process.env.DISCUZ_ENV === 'mini') {
  attachmentApiUpload = require('./adapter/attachment-api-mini-upload.js');
} else if (process.env.DISCUZ_ENV === 'web') {
  attachmentApiUpload = require('./adapter/attachment-api-web-upload.js');
}

export default attachmentApiUpload.default;