import Taro from '@tarojs/taro';

export default function isSupportWebp() {
    let isSupportWebp = false;
    try {
        if (Taro.getSystemInfoSync().platform === 'android') {
            isSupportWebp = true;
        } else {
            isSupportWebp = false;
        }
    } catch(err) {
        isSupportWebp = false;
    }
    return isSupportWebp;
}