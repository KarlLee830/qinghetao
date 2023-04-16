import isServer from '@common/utils/is-server';
/**
 * 获取当前平台
 * @param {string} ua 当前 UserAgent
 */
export default function getPlatform(ua) {
  let platform = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ? 'h5' : 'pc';
  if (!isServer()) {
      // 是否是横屏
      // 废弃的，但是目前是支持的。https://developer.mozilla.org/en-US/docs/Web/API/Window/orientation
      const isLandscape = Math.abs(window.orientation) === 90;
      const currentWidth = window.innerWidth;
      if ( platform === 'pc' && currentWidth < 800 ) {
        platform = 'h5';
      }

      if (  platform === 'h5' && !isLandscape && currentWidth >= 800 ) {
        platform = 'pc';
      }
  }
  return platform
}
