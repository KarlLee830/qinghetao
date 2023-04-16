// SSR的同时，确保static部署不会引入此代码内容，通过虚拟滚动异步加载载入代码块

let threadComponent = () => {};
if (process.env.DISCUZ_RUN === 'ssr') {
    // taro项目的小程序
    threadComponent = require('./index.jsx');
}
if (process.env.DISCUZ_ENV === 'static') {
    threadComponent = {default: null};
}

export default threadComponent.default;