module.exports = {
  env: {
    es6: true,
    node: true,
    browser: true,
    jest: true,
  },
  extends: 'tencent',
  rules: {
    'no-useless-constructor': 0,
    'no-underscore-dangle': 0,
  },
  globals: {
    DISCUZ_ENV: true,
    uni: true,
    my: true,
    tt: true,
    swan: true,
    qq: true,
    wx: true,
    jd: true,
  },
};
