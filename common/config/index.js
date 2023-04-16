const config = {
  version: DISCUZ_CONFIG_VERSION
};

module.exports = function () {
  if (process.env.NODE_ENV === 'development') {
    return Object.assign({}, config, require('./dev'));
  }
  return Object.assign({}, config, require('./prod'));
};
