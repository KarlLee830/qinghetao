import { baseLineHeight } from './constants';

const miniCodeWidth = 192;
const miniCodeRight = 40;

export const getFooterConfig = ({ baseHeight, codeUrl, siteName }) => {
  const image = handleMiniCode(codeUrl, baseHeight);
  const desc = handleDesc(baseHeight);
  const siteDesc = handleSiteDes(baseHeight, siteName);
  
  return {
    height: baseLineHeight + miniCodeWidth,
    config: {
      blocks: [siteDesc],
      texts: [desc],
      images: [image],
    },
  };
};

// 小程序二维码
const handleMiniCode = (codeUrl, baseHeight) => ({
    url: codeUrl,
    x: 260,
    y: baseHeight + baseLineHeight,
    height: 192,
    width: 192,
    zIndex: 10,
  });

const handleDesc = (baseHeight) => ({
    text: '长按识别小程序码查看详情',
    color: '#0B0B37',
    x: 188,
    y: baseHeight + miniCodeWidth + miniCodeRight + baseLineHeight,
    fontSize: 28,
    lineHeight: baseLineHeight,
    zIndex: 20,
    lineNum: 1,
    textAlign: 'left',
    baseLine: 'top',
    fontFamily: 'PingFang SC',
  });

// 站点描述
const handleSiteDes = (baseHeight, siteName) => ({
  x: 0,
  y: baseHeight + baseLineHeight + miniCodeWidth + miniCodeRight + 36,
  text: {
    text: `来自${siteName}`,
    color: '#8590A6',
    fontSize: 24,
    zIndex: 20,
    lineNum: 1,
    baseLine: 'bottom',
    textAlign: 'center',
    fontFamily: 'PingFang SC',
  },
  height: 78,
  width: 710,

  });
