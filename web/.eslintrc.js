module.exports = {
  env: {
    es6: true,
    node: true,
    browser: true,
    jest: true,
  },
  extends: [
    'tencent',
    'eslint:recommended',
    'plugin:react/recommended',
  ],
  plugins: ['prettier', 'react', 'react-hooks', 'import'],
  parserOptions: {
    ecmaVersion: 2018,
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/prop-types': 0,
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
