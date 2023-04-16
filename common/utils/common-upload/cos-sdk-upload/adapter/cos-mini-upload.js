// cos 上传wiki：https://cloud.tencent.com/document/product/436/11459
import { getCosTmpKey, updateAttachment } from '@common/server';
import time from '@discuzqsdk/sdk/dist/time';
const COS = require('./cos-wx-sdk-v5');

export default (options) => {
  return new Promise(async (resolve, reject) => {

    const {
      file,
      type,
      qcloudCos,
      qcloudCosBucketName: Bucket,
      qcloudCosBucketArea: Region,
      qcloudCosSignUrl: isOpenSign,
    } = options;

    if (!qcloudCos || typeof file === 'string') {
      reject('error');
      return;
    }

    const filePath = file.path;
    const filename = filePath.substr(filePath.lastIndexOf('/') + 1);
    // const fileSize = file.size;
    const path = `public/attachments/${time.formatDate(new Date(), 'YYYY/MM/DD')}/`;

    // 初始化cos实例
    const cos = new COS({
      getAuthorization: async (_options, callback) => {
        const res = await getCosTmpKey({
          type,
          attachment: filename,
          fileName: type === 1 ? filename : file.name,
        });
        const { code, data } = res;
        if (code === 0) {
          const credentials = data && data.credentials;
          callback({
            TmpSecretId: credentials.tmpSecretId,
            TmpSecretKey: credentials.tmpSecretKey,
            XCosSecurityToken: credentials.sessionToken,
            StartTime: data.startTime,
            ExpiredTime: data.expiredTime,
          });
        } else {
          // todo: 处理异常情况，获取临时密钥失败
          reject('error');
        }
      }
    });

    // 使用cos实例上传并生成url
    cos.postObject({
      Bucket,
      Region,
      Key: path + filename,
      FilePath: filePath,
      onProgress: (info) => {
          console.log(JSON.stringify(info));
      }
    }, (err) => {
      if (err === null) {
        cos.getObjectUrl({
          Bucket: Bucket,
          Region: Region,
          Key: path + filename,
          Sign: isOpenSign,
        }, async (err, data) => {
          if (err === null) {
            const { Url: cosUrl } = data;
            const res = await updateAttachment({
              type,
              cosUrl,
              fileName: type === 1 ? filename : file.name,
            });
            resolve(res);
          } else if (err) {
            // todo: 异常情况处理，上传失败
            reject(err);
          }
        });
      } else if (err) {
        // todo: 异常情况处理，上传失败
        reject(err);
      }
    });

  });
};
