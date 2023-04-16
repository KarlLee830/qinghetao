const H5_ORIENT = '__dzq_h5_orient';

// h5页面检测是否横屏
export function detectH5Orient() {
  if (typeof window !== 'object') {
    return;
  }

  const storage = sessionStorage;
  const screenParams = storage.getItem(H5_ORIENT);
  const clientWidth = document.documentElement.clientWidth;
  let _Width = 0;
  let _Height = 0;

  if (!screenParams) {
    const {width, height} = window.screen;
    _Width = width < height ? width : height;
    _Height = width >= height ? width : height;
    storage.setItem(H5_ORIENT, `${_Width},${_Height}`);
  } else {
    [_Width, _Height] = screenParams.split(',');
  }

  // 是否为竖屏
  return Math.abs(_Height - clientWidth) > Math.abs(_Width - clientWidth);
}
