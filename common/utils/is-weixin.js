export default function isWeiXin() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /micromessenger/.test(ua);
}
