let getPlatform = () => { };

if (process.env.DISCUZ_ENV === 'mini') {
  getPlatform = require('./mini').getPlatform;
}
if (process.env.DISCUZ_ENV === 'web') {
  getPlatform = require('./web').getPlatform;
}

export default getPlatform;
