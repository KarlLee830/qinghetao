/**
 * 获取屏幕高度
 * @returns {number} 屏幕高度
 */
export function getClientHeight() {
  let winHeight;
  if (typeof window === 'undefined') return 0;
  if (window.innerHeight) {
    winHeight = window.innerHeight;
  } else if ((document.body) && (document.body.clientHeight)) {
    winHeight = document.body.clientHeight;
  } else if (document.documentElement
    && document.documentElement.clientHeight
    && document.documentElement.clientWidth) {
    winHeight = document.documentElement.clientHeight;
  }
  return winHeight;
}

export function getVisualViewpost() {
  let visualHeight;
  if (typeof window === 'undefined') return 0;
  if (window.visualViewport) {
    visualHeight = window.visualViewport.height;
  } else {
    visualHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
    );
  }
  return visualHeight;
}

export function getKeywordsHeight() {
  return getClientHeight() - getVisualViewpost();
}
