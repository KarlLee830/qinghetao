import { getImageInfo } from '@tarojs/taro';

// web环境判断
function isWeb() {
  return process.env.DISCUZ_ENV === 'web';
}

const miniCheckImgExists = (imgUrl, newUrl) => new Promise((resolve, reject) => {
  getImageInfo({
    src: imgUrl,
    success: () => {
      resolve(imgUrl);
    },
    fail: () => {
      resolve(newUrl);
    },
  });
});

const webCheckImgExists = (imgUrl, newUrl) => new Promise((resolve, reject) => {
  const imgObj = new Image();
  imgObj.onload = () => {
    resolve(imgUrl);
  };
  imgObj.onerror = () => {
    resolve(newUrl);
  };
  imgObj.src = imgUrl;
});

export default isWeb() ? webCheckImgExists : miniCheckImgExists;
