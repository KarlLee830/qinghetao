/* 全局相关 */
export const posterFrameWidth = 8;

// 海报画布宽度
export const posterWidth = 710 - posterFrameWidth * 2;


// 帖子边距
export const posterPadding = 16;

// 元素间的间距
export const padding32 = 32;

// 内容宽度
export const contentWidth = posterWidth - posterPadding * 2 - posterFrameWidth * 2;

export const screenHeight = 700;

export const commentX = 120;

export const commentWidth = posterWidth -commentX -25;



export const nameAndTagsY = 32;

export const descriptionY = 76;

// 每一行文字的高度
export const baseLineHeight = 52;

// 海报最大高度，超过高度显示「查看更多」
export const maxContentHeight = 3800;

// X轴，从此位置开始绘制
export const baseX = posterFrameWidth + posterPadding;

/* header相关 */

// 帖子头部「头像」宽度
export const avatarWidth = 76;

// 帖子头部「定位」icon宽度
export const positionIconWidth = 20;

// 帖子头部「眼睛」icon宽度
export const eyeIconWidth = 28;

// 帖子头部高度
export const userInfoHeight = 140;

// 元素之间最小间距
export const minGap = 4;

// 上下图片之间间距
export const imagesGap = 32;

// 时间和昵称开始
export const descriptionStartsX = baseX + avatarWidth + minGap * 4;

// 分类标签高度
export const categoryHeight = 50;

// 付费或无内容时海报内容区域高度
export const priceContentHeight = 326;
