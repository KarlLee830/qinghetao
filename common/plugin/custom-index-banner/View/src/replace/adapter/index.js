let pluginComponent = () => {};
if (process.env.DISCUZ_ENV === 'mini') {
  pluginComponent = require('./mini/index.jsx.js');
}
if (process.env.DISCUZ_ENV === 'web') {
  pluginComponent = require('./web/index.jsx');
}

export default pluginComponent.default;
