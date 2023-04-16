import Toast from '@discuzqsdk/design/dist/components/toast';
import Taro from '@tarojs/taro';
// 汉字算2个字符，字母数字算1.2个
export const getByteLen = (val) => {
  let len = 0;
  for (let i = 0; i < val.length; i++) {
    const a = val.charAt(i);
    if (a.match(/[^\x00-\xff]/ig) != null) {
      len += 2;
    } else {
      switch(a) {
        case '1': len += 0.8; break;
        case '7': len += 1.09; break;
        case ' ': len += 0.66; break;
        case ':': len += 0.52; break;
        default: len += 1.2;
      }
    }
  }
  return len;
}

export const cutText = (content, contentWidth, maxLine) => {
  const everyLineNum = Math.floor(contentWidth/28);
  const date = new Date();
  const replaceTextSign = `${date.getTime()}`;
  let contentArr = content.replace(/[\n]/g, replaceTextSign).split(replaceTextSign);
  let textLineNumber = 0;

  console.log(contentArr);
  // 将文本分段判断文本行数，每段文本末尾会有一个换行符被统计视为一行，所以每段文本最后一行不记录统计行数
  for (let i = 0; i < contentArr.length; i++) {
    if(contentArr[i]) {
      const partLine = Math.ceil((getByteLen(contentArr[i]) * 16) / contentWidth);
      if(textLineNumber + partLine >= maxLine){
        contentArr[i] = contentArr[i].slice(0, everyLineNum*( maxLine - textLineNumber) );
        contentArr = contentArr.slice(0,i+1);
        break
      }else{
        textLineNumber += partLine;
      }
    }
  }
  return contentArr.join('\n');
}

const openConfirm = function () {
  Taro.showModal({
    content: '检测到您没打开此小程序的相机权限，是否去设置打开？',
    confirmText: "确认",
    cancelText: "取消",
    success(res) {
      // 点击“确认”时打开设置页面
      if (res.confirm) {
        Taro.openSetting({
          success: () => { }
        })
      } else {
        Toast.error({
          content: '授权失败',
          icon: 'none',
          duration: 2000,
        });
      }
    }
  });
}

const savaImg = (shareImage) => {
  Taro.showLoading({
    title: '正在保存至相册'
  })
  Taro.saveImageToPhotosAlbum({
    filePath: shareImage,
    success: (res) => {
      if (res.errMsg === 'saveImageToPhotosAlbum:ok') {
        Taro.hideLoading();
        Toast.info({
          content: '保存图片成功',
          icon: 'success',
          duration: 2000,
        });
      }
    },
    fail: () => {
      Taro.hideLoading();
      Toast.error({
        content: '保存图片失败',
        icon: 'none',
        duration: 2000,
      });
    }
  })
}

export const saveToAlbum = (shareImage) => () => {
  Taro.getSetting().then(mes => {
    if (mes.authSetting['scope.writePhotosAlbum']) {
      savaImg(shareImage)
    } else {
      Taro.authorize({
        scope: 'scope.writePhotosAlbum',
        fail: () => {
          openConfirm()
        },
        success: () => {
          savaImg(shareImage)
        }
      })
    }
  })
};

// base64转url
export function checkAndGetBase64Src(imgPath, index) {
  return new Promise((resolve, reject) => {
    const[, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(imgPath) || [];
    if(!format) {
      resolve(imgPath);
      return;
    }
    const timestamp = Date.parse(new Date());
    const filePath = `${Taro.env.USER_DATA_PATH}/temp${index || '',timestamp}.png`;
    const buffer = Taro.base64ToArrayBuffer(bodyData);

    const fsm = Taro.getFileSystemManager();
    fsm.writeFile({
      filePath,
      data: buffer,
      encoding:'binary',
      success() {
        resolve(filePath);
      },
      fail(err) {
        reject(err);
      }
    });
  });
}
