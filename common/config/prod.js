module.exports = {
  TITLE: DISCUZ_CONFIG_TITLE,
  COMMON_BASE_URL: process.env.DISCUZ_ENV === 'web' ?  '' : DISCUZ_CONFIG_HOST,
};
