
import locals from '@common/utils/local-bridge';
import constants from '@common/constants';
import Taro from '@tarojs/taro';
import Toast from '@discuzqsdk/design/dist/components/toast/index';

const attachmentApiUpload = (options) => {
  return new Promise(async (resolve, reject) => {
    const { file, type, host } = options;
    const tempFilePath = file.path || file.tempFilePath;
    const token = locals.get(constants.ACCESS_TOKEN_NAME);
    const formData = {
      type,
    };

    if (type === 0) {
      formData.name = file.name;
    }

    Taro.uploadFile({
      url: `${host}/api/v3/attachments`,
      filePath: tempFilePath,
      name: 'file',
      header: {
        'authorization': `Bearer ${token}`
      },
      formData: formData,
      success(res) {
        if (res.statusCode === 200) {
          const ret = JSON.parse(res.data);

          for (const key in ret) {
            if (Object.hasOwnProperty.call(ret, key)) {
              ret[key.toLowerCase()] = ret[key];
            }
          }

          resolve(ret);
        } else {
          reject('error');
          const msg = res.statusCode === 413 ? '上传大小超过了服务器限制' : res.msg;
          Toast.error({ content: `上传失败：${msg}` });
        }
      },
      fail(res) {
        reject('error');
        console.log(res);
      }
    });
  });
};

export default attachmentApiUpload;