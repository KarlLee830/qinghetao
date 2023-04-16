export const getPlatform = (userAgent) => {
  if (!userAgent) return 'none';
  const isMobile = /(AppleWebKit.*Mobile.*|mobile|android|iphone|ipad|blackberry|hp-tablet|symbian|phone|windows\sphone)/i.test(userAgent);
  return isMobile ? 'h5' : 'pc';
};
