import calcImageQuality from '@common/utils/calc-cos-image-quality/calc-image-quality';
import Taro from '@tarojs/taro';

export default function taro(src, type, level) {
    const [path, param] = src.split('?');
    const info = Taro.getSystemInfoSync();
    const viewWidth = info.windowWidth;
    let paramArr = [];
    const newParam = calcImageQuality(viewWidth, type, level);

    if (param && param !== '') {
        paramArr = param.split('&');
    }
    paramArr.push(newParam);
    const newSrc = `${path}?${paramArr.join('&')}`;

    return newSrc;
}