import cosSdkUpload from './cos-sdk-upload';
import attachmentApiUpload from './attachment-api-upload';

const commonUpload = (options) => {
  const {
    files,
    type, // 上传类型，1是图片、2是附件
    qcloudCos, // 管理端是否配置了cos
    qcloudCosBucketName, // 存储桶名称
    qcloudCosBucketArea, // cos地区名称
    qcloudCosSignUrl, // 是否开启了cos签名
    supportImgExt, // 支持上传的图片格式
    supportMaxSize, // 支持上传的最大体积
  } = options;

  return Promise.all(files.map(file => {

    const opts = {
      file,
      ...options
    };

    return new Promise(async (resolve, reject) => {
      try {
        const res = await cosSdkUpload(opts);
        resolve(res);
      } catch (error) {

        try {
          const res = await attachmentApiUpload(opts);
          resolve(res);
        } catch (error) {
          reject('error');
        }

      }
    });

  }));
};

export default commonUpload;
