import calcImageQuality from '@common/utils/calc-cos-image-quality/calc-image-quality';
import isServer from '@common/utils/is-server';
export default function next(src, type, level) {
    const [path, param] = src?.split('?');
    let paramArr = [];

    const viewWidth = isServer() ? 1080 : window.screen.width;
    const newParam = calcImageQuality(viewWidth, type, level);

    if (param && param !== '') {
        paramArr = param?.split('&');
    }
    paramArr.push(newParam);
    const newSrc = `${path}?${paramArr.join('&')}`;

    return newSrc;
}