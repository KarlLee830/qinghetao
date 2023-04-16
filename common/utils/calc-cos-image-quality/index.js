let calcCosImageQuality = () => {};
if (process.env.DISCUZ_ENV === 'mini') {
    // taro项目的小程序
    calcCosImageQuality = require('./adapter/taro.js');
}
if (process.env.DISCUZ_ENV === 'web') {
    calcCosImageQuality = require('./adapter/next.js');
}

export default calcCosImageQuality.default;