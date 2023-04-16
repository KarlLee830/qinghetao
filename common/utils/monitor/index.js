let setTitle = () => {};
if (process.env.DISCUZ_ENV === 'mini') {
    // taro项目的小程序
    setTitle = require('./adapter/taro.js');
}
if (process.env.DISCUZ_ENV === 'web') {
    setTitle = require('./adapter/next.js');
}

export default setTitle.default;