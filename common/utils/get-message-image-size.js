
export const getMessageImageSize = (imageWidth, imageHeight, isPC = false) => {
  let width = 0;
  let height = 0;
  const ratio = (parseInt(imageWidth) / parseInt(imageHeight)).toFixed(1); // 宽高比
  const scale = isPC ? 2 : 3; // 参考微信截图尺寸，移动端宽高统一除以3；PC端除以2

  if (ratio < 0.4) {
    width = 204;
    height = 510;
  } else if (ratio >= 0.4 && ratio <= 0.5) {
    width = 204;
    height = 204 / ratio;
  } else if (ratio > 0.5 && ratio < 1) {
    width = 405 * ratio;
    height = 405;
  } else if (ratio >= 1 && ratio < 1 / 0.5) { //和前面的宽高转置
    height = 405 * (1 / ratio);
    width = 405;
  } else if (ratio >= 1 / 0.5 && ratio < 1 / 0.4) {
    height = 204;
    width = 204 / (1 / ratio);
  } else if (ratio >= 1 / 0.4) {
    height = 204;
    width = 510;
  }

  return [parseInt(width / scale), parseInt(height / scale)]
}