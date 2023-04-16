let isSupportWebp = () => {};
if (process.env.DISCUZ_ENV === 'mini') {
    // taro项目的小程序
    isSupportWebp = require('./adapter/taro-is-support-webp.js');
}
if (process.env.DISCUZ_ENV === 'web') {
    isSupportWebp = require('./adapter/next-is-support-webp.js');
}

export default isSupportWebp.default;