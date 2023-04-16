let cosSdkUpload = () => {};

if (process.env.DISCUZ_ENV === 'mini') {
    cosSdkUpload = require('./adapter/cos-mini-upload.js');
} else if (process.env.DISCUZ_ENV === 'web') {
    cosSdkUpload = require('./adapter/cos-web-upload.js');
}

export default cosSdkUpload.default;