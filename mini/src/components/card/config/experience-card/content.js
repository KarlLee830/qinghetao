import {
  posterWidth,
  baseLineHeight,
  minGap,
} from '../constants';

const circlesData = [
  {
    x: 2 * 2,
    y: 366 * 2,
    width: 16 * 2,
    height: 16 * 2,
    zIndex: 20,
    backgroundColor: '#2469F6'
  },
  {
    x: posterWidth - 18 * 2,
    y: 366 * 2,
    width: 16 * 2,
    height: 16 * 2,
    zIndex: 20,
    backgroundColor: '#2469F6'
  },
]

const miniCodeWidth = 192;

export const getContentConfig = ({ experienceData, miniCode, codeUrl, site, baseHeight }) => {
  const { avatarBlock, avatarImage } = handleAvatar(experienceData, baseHeight);
  const nicknameText = handleNickname(experienceData, baseHeight);
  const image = handleMiniCode(codeUrl, baseHeight);
  const siteName = handleSiteName(site, baseHeight);
  const tips = handleTips(baseHeight);
  const line = handleLines(baseHeight);
  const circles = handleCircle(circlesData);
  const experienceCardTime = handleExperienceCardTime(baseHeight, miniCode?.timeRange);
  const invite = handleInvite(site, baseHeight);
  const desc = handleDesc(baseHeight);
  const expirationTime = handleExpirationTime(baseHeight, miniCode?.endTime);
  const bgc = handleBgc(baseHeight);

  const contentConfig = {
    height: baseHeight + 540 * 2 + 48,
    config: {
      images: [image],
      blocks: [
        bgc,
        nicknameText,
        siteName,
        invite,
        experienceCardTime,
        ...circles,
      ],
      texts: [
        desc,
        tips,
        expirationTime
      ],
      lines: [
          line
      ]
    },
  };

  if (!experienceData.user.avatarUrl) {
    contentConfig.config.blocks.push(avatarBlock);
  } else {
    contentConfig.config.images.push(avatarImage);
  }

  return contentConfig;
};

// 处理背景图片
const handleBgc = (baseHeight) => {
  return {
    x: 20,
    y: baseHeight + 20,
    width: posterWidth - 40,
    height: 540 * 2,
    backgroundColor: '#fff',
    zIndex: 10,
    borderRadius: 20,
  };
};

// 处理头像
const handleAvatar = (experienceData, baseHeight) => {
  const avatar = experienceData.user.avatarUrl || '';
  let avatarBlock = {};
  let avatarImage = {};
  if (!avatar) {
    avatarBlock = getAvatarBlock(experienceData, baseHeight);
  } else {
    avatarImage = getAvatarImage(experienceData, baseHeight);
  }
  return {
    avatarBlock,
    avatarImage,
  };
};

// 处理头像
const getAvatarBlock = (experienceData, baseHeight) => {
  const { nickname } = experienceData.user;
  const name = nickname.charAt(0);
  return {
    x: 118 * 2,
    y: baseHeight + 92 * 2,
    width: 120 * 2,
    height: 120 * 2,
    borderRadius: 120 * 2,
    borderColor: '#000',
    backgroundColor: '#8590a6',
    text: {
      text: name,
      color: '#fff',
      fontSize: 28,
      lineHeight: 28,
      textAlign: 'center',
      baseLine: 'middle',
      zIndex: 10,
      fontFamily: 'PingFang SC',
      width: 120 * 2 - minGap * 6,
    },
    zIndex: 20,
  };
};

// 处理头像
const getAvatarImage = (experienceData, baseHeight) => {
  const avatar = experienceData.user.avatarUrl || '';
  console.log(avatar);
  return {
    url: avatar,
    x: 118 * 2,
    y: baseHeight + 92 * 2,
    width: 120 * 2,
    height: 120 * 2,
    borderRadius: 120 * 2,
    zIndex: 20,
  };
};

// 处理昵称
const handleNickname = (experienceData, baseHeight) => {
  const nickname = experienceData.user.nickname || '';
  return {
    x: 0,
    y: baseHeight + 228 * 2,
    text: {
      text: nickname,
      color: '#0B0B37',
      fontSize: 16 * 2,
      zIndex: 20,
      lineNum: 1,
      baseLine: 'top',
      textAlign: 'center',
      fontFamily: 'PingFang SC',
    },
    width: 355 * 2,
    height: 22 * 2,
    zIndex: 20,
  };
};

// 小程序二维码
const handleMiniCode = (codeUrl, baseHeight) => ({
  url: codeUrl,
  x: 260,
  y: baseHeight + 390 * 2,
  height: 192,
  width: 192,
  zIndex: 20,
});

const handleDesc = (baseHeight) => ({
  text: '长按识别小程序码',
  color: '#4f5a70',
  x: 122 * 2,
  y: baseHeight + miniCodeWidth + 390 * 2 + baseLineHeight,
  fontSize: 28,
  lineHeight: baseLineHeight,
  zIndex: 20,
  lineNum: 1,
  textAlign: 'left',
  baseLine: 'top',
  fontFamily: 'PingFang SC',
});

const handleExpirationTime = (baseHeight, endTime) => {
  return {
    x: 74 * 2,
    y: baseHeight + 338 * 2,
    text: `${endTime || ''}此小程序码失效`,
    color: '#8590a6',
    fontSize: 14 * 2,
    textAlign: 'left',
    baseLine: 'top',
    lineHeight: 22 * 2,
    zIndex: 20,
  };
};

const handleSiteName = (site, baseHeight) => ({
  x: 0,
  y: baseHeight + 20 * 2,
  text: {
    text: site.siteName || '',
    color: '#0B0B37',
    fontSize: 20 * 2,
    zIndex: 20,
    lineNum: 1,
    baseLine: 'top',
    textAlign: 'center',
    fontFamily: 'PingFang SC',
  },
  width: 355 * 2,
  height: 20 * 2,
  zIndex: 20,
})

const handleTips = (baseHeight) => ({
  x: 143 * 2,
  y: baseHeight + 56 * 2,
  text: '免费体验卡',
  color: '#4F5A70',
  fontSize: 14 * 2,
  zIndex: 20,
  textAlign: 'left',
  baseLine: 'top',
  lineHeight: 22 * 2
})

const handleInvite = (site, baseHeight) => ({
  x: 0,
  y: baseHeight + 266 * 2,
  text: {
    text: `邀你领取 ${site?.siteName || ''}`,
    color: '#4F5A70',
    fontSize: 14 * 2,
    zIndex: 20,
    lineNum: 1,
    baseLine: 'top',
    textAlign: 'center',
    fontFamily: 'PingFang SC',
  },
  width: 355 * 2,
  height: 20 * 2,
  zIndex: 20,
})

const handleExperienceCardTime = (baseHeight, time = '') => ({
  x: 0,
  y: baseHeight + 294 * 2,
  text: {
    text: `${time}天免费体验卡`,
    color: '#4F5A70',
    fontSize: 20 * 2,
    zIndex: 20,
    lineNum: 1,
    baseLine: 'top',
    textAlign: 'center',
    fontFamily: 'PingFang SC',
  },
  width: 355 * 2,
  height: 20 * 2,
  zIndex: 20,
})


const handleLines = (baseHeight) => {
  const lineHeight = 374 * 2;
  return {
      startX: 34 * 2,
      startY: lineHeight + baseHeight,
      endX: posterWidth - 34 * 2,
      endY: lineHeight + baseHeight,
      width: 1,
      color: '#707070',
      zIndex: 20,
      dashData: [4, 4],
  }
}

const handleCircle = (circles) => circles.map(item => ({
    x: item.x,
    y: item.y,
    width: item.width,
    height: item.height,
    borderRadius: item.width,
    backgroundColor: item.backgroundColor,
    zIndex: item.zIndex || 0
}));