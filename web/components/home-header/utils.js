export const isWx = () => {
  const ua = navigator.userAgent.toLowerCase();
  const isWeixin = ua.indexOf('micromessenger') !== -1;
  if (isWeixin) {
    return true;
  }
  return false;
};
