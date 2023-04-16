import { readYundianboSignature } from '@common/server';

const getYundianboSignature = async () => {
  const res = await readYundianboSignature();
  const { code, data } = res;
  return code === 0 ? data.token : '';
};

/**
 * 腾讯云点播上传
 * https://cloud.tencent.com/document/product/266/9239
 */
export const tencentVodUpload = async ({
  file, // 要上传的文件
  onUploading = () => { },
  onComplete = () => { },
  onError = () => { },
}) => {
  const TcVod = (await import('vod-js-sdk-v6')).default;
  new TcVod({
    // 获取上传签名的函数
    getSignature: getYundianboSignature,
  })
    // 开始上传
    .upload({ mediaFile: file })
    .on('media_progress', () => {
      onUploading();
    })
    .done()
    // 上传完成
    .then((res) => {
      onComplete(res, file);
    })
    // 上传异常
    .catch((err) => {
      onError(err);
    });
};
