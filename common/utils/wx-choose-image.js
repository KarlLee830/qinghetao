/* eslint-disable no-plusplus */
/* eslint-disable prefer-destructuring */
import browser from '@common/utils/browser';

const dataURLtoFile = (dataurl, filename = 'image') => {
  const arr = dataurl.split(',');
  let dataStr = '';
  let typeStr = 'data:image/jpg;base64';
  if (arr.length > 1) {
    [typeStr, dataStr] = arr;
  } else {
    [dataStr] = arr;
  }
  // 获取图片类型
  const mime = typeStr.match(/:(.*?);/)[1] || 'image/jpg';
  const bstr = atob(dataStr);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

const wxChooseImage = () => new Promise(async (resolve) => {
  // 验证不通过，jssdk接口不可用，resolve一个空数组给业务，业务自行判断并进行图片选择的降级处理
  // step 1: 判断是否是微信环境、是否是安卓环境、jssdk文件是否下载并执行、是否已经执行config
  if (!browser.env('weixin') || !browser.env('android') || !(window.wx && wx.hasDoneConfig)) {
    resolve([]);
    return;
  }

  // step 2:判断jssdk鉴权是否通过
  const isApiConfigSuccess = await new Promise((resolve) => {
    wx.getNetworkType({
      success: () => resolve(true),
    });
    wx.error(() => resolve(false));
  });
  if (!isApiConfigSuccess) {
    resolve([]);
    return;
  }


  // 验证通过，接口可用，开始选择图片
  wx.chooseImage({
    count: 9,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const { localIds } = res;

      const result = await Promise.all(localIds.map(localId => (
        new Promise((resolve) => {
          // 把图片转换为本地base64格式
          wx.getLocalImgData({
            localId,
            success: (res) => {
              // 把base64转换为file对象
              const file = dataURLtoFile(res.localData);
              file.imageType = file.type.replace('image/', '');
              file.localId = localId;
              file.src = res.localData;
              resolve(file);
            },
          });
        })
      )));


      // const result = await Promise.all(localIds.map(localId => (
      //   new Promise((resolve) => {
      //     wx.uploadImage({
      //       localId,
      //       isShowProgressTips: 0,
      //       success: (res) => {
      //         const { serverId } = res;
      //         resolve({
      //           localId,
      //           serverId,
      //         });
      //       },
      //     });
      //   })
      // )));

      // 返回结果
      resolve(result);
    },
  });
});

export default wxChooseImage;

