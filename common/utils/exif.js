import EXIF from 'exif-js';
import { detectImageAutomaticRotation } from '@common/utils/detect-image-automatic-rotation';
/**
 * 修正图片旋转角度问题
 * @param {file} 原图片
 * @return {Promise} resolved promise 返回纠正后的新图片
 */
export function fixImageOrientation(file) {
  return new Promise((resolve) => {
    try {
    // 获取图片
      const img = new Image();
      img.src = window.URL.createObjectURL(file);
      img.onerror = () => resolve(file);
      img.onload = () => {
      // 获取图片元数据（EXIF 变量是引入的 exif-js 库暴露的全局变量）
        detectImageAutomaticRotation().then((status) => {
          EXIF.getData(img, function () {
          // 获取图片旋转标志位
            const orientation = EXIF.getTag(this, 'Orientation');
            // 根据旋转角度，在画布上对图片进行旋转
            if (orientation === 3 || orientation === 6 || orientation === 8) {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              switch (orientation) {
                case 3: // 旋转180°
                  canvas.width = img.width;
                  canvas.height = img.height;
                  ctx.rotate((180 * Math.PI) / 180);
                  ctx.drawImage(img, -img.width, -img.height, img.width, img.height);
                  break;
                case 6: // 旋转90°
                  if (status) {
                    // 如果浏览器自动回正
                    canvas.height = img.height;
                    canvas.width = img.width;
                    ctx.drawImage(img, 0, 0);
                  } else {
                    canvas.width = img.height;
                    canvas.height = img.width;
                    ctx.rotate((90 * Math.PI) / 180);
                    ctx.drawImage(img, 0, -img.height, img.width, img.height);
                  }
                  break;
                case 8: // 旋转-90°
                  canvas.width = img.height;
                  canvas.height = img.width;
                  ctx.rotate((-90 * Math.PI) / 180);
                  ctx.drawImage(img, -img.width, 0, img.width, img.height);
                  break;
              }
              // 返回新图片
              canvas.toBlob(file => resolve(file), 'image/jpeg', 0.92);
            } else {
              return resolve(file);
            }
          });
        });
      };
    } catch (e) {
      console.error(e);
      resolve(file);
    }
  });
}
