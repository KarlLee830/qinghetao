import { getByteLen } from '../utils'
import eyeImg from '../card-img/eye.png'
import position from '../card-img/position.png'
import { posterFrameWidth, posterWidth, descriptionY, positionIconWidth, eyeIconWidth, nameAndTagsY, posterPadding, avatarWidth, userInfoHeight, descriptionStartsX, baseX, minGap } from './constants';
import browser from '../../../../../common/utils/browser'

export const getHeaderConfig = ({ thread }) => {
    const {avatarBlock, avatarImage} = handleAvatar(thread);
    const tags = handleTags(thread)
    const {descTexts, descImages} = handleDesc(thread)
    const nicknameText = handleNickname(thread)
    const headerConfig = {
      height: userInfoHeight,
      config: {
          texts: [
            // 昵称
            nicknameText,
            ...descTexts
          ],
          blocks: [ ...tags ],
          images: [ ...descImages ],
      }
    };
    if(!thread.user.avatar || thread.isAnonymous) {
      headerConfig.config.blocks.push(avatarBlock);
    } else {
      headerConfig.config.images.push(avatarImage);
    }

    return headerConfig;
}

// 处理头像
const handleAvatar = (thread) => {
  const avatar = thread.user.avatar || ''
  let avatarBlock = {};
  let avatarImage = {};
  if(!avatar || thread.isAnonymous) {
    avatarBlock = getAvatarBlock(thread);
  } else {
    avatarImage = getAvatarImage(thread);
  }
  return {
    avatarBlock,
    avatarImage
  }
}

// 处理头像
const getAvatarBlock = (thread) => {
  let {nickname} = thread.user
  if(thread.isAnonymous) {
    nickname = '匿'
  }
  const name = nickname.charAt(0)
  return {
    x: baseX,
    y: nameAndTagsY,
    width: avatarWidth,
    height: 76,
    borderRadius: 76,
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
      width: avatarWidth - minGap * 6,
    },
    zIndex: 10,
  }
}

// 处理头像
const getAvatarImage = (thread) => {
    const avatar = thread.user.avatar || ''
    return {
        url: avatar,
        x: baseX,
        y: nameAndTagsY,
        width: avatarWidth,
        height: avatarWidth,
        borderRadius: 76,
        borderColor: '#000',
        zIndex: 10,
    }
}

// 处理昵称
const handleNickname = (thread) => {
  let nickname = thread.user.nickname || ''
  if(thread.isAnonymous) {
    nickname = '匿名用户'
  }
  return {
    text: nickname,
    color: '#0B0B37',
    x: descriptionStartsX,
    y: nameAndTagsY,
    width: 600,
    lineHeight: 40,
    fontSize: 28,
    textAlign: 'left',
    zIndex: 10,
    baseLine: 'top',
  }
}

// 处理头像旁边的描述
const handleDesc = (thread) => {
    const descriptionFontSize = 12;
    const positionMaxLength = 180;
    // 处理位置宽度
    let positionLength = getByteLen(thread.position?.location) * descriptionFontSize;
    if (positionLength !== 0) {
        positionLength = positionLength + positionIconWidth + minGap;
    }
    if (positionLength > positionMaxLength) {
        positionLength = positionMaxLength;
    }
    // 处理发布时间宽度
    const diffTimeLength = getByteLen(thread.diffTime.substr(0, 10)) * descriptionFontSize;
    let length = 8
    // 计算观看数量的间隔
    if(positionLength) {
      length = 12
    }
    // 在ios系统中的偏移量
    let offset = -2
    // 判断是否在安卓或苹果
    if(browser.env('android')) {
      offset = 0
    }
    // 观看数量开始
    const viewIconStartsX = descriptionStartsX + 
                            diffTimeLength + 
                            positionLength + 
                            minGap * length +
                            (positionLength === positionMaxLength ? positionIconWidth : 0);
    const descTexts = [
        // 时间，比如：40分钟前
        {
            text: thread.diffTime.substr(0, 10),
            color: '#8590A6',
            x: descriptionStartsX,
            y: descriptionY,
            width: diffTimeLength + minGap * 4,
            lineHeight: 34,
            fontSize: 24,
            textAlign: 'left',
            zIndex: 20,
            baseLine: 'top'
        },
        // 观看数量
        {
            text: `${thread.viewCount}`,
            color: '#8590A6',
            x: viewIconStartsX + minGap * 2 + eyeIconWidth,
            y: descriptionY,
            width: 100,
            lineHeight: 34,
            fontSize: 24,
            textAlign: 'left',
            zIndex: 10,
            baseLine: 'top'
        },
    ]
    const descImages = [
        // eye
        {
            url: eyeImg,
            x: viewIconStartsX,
            y: descriptionY + 6 + offset,
            height: 20 + 2,
            width: eyeIconWidth + 4,
            zIndex: 10,
        },
    ]
    if (thread.position.location) {
        const positionIconStartsX = descriptionStartsX + diffTimeLength + minGap * 8
        descTexts.push(
            // 位置
            {
                text: thread.position.location,
                color: '#8590A6',
                x: positionIconStartsX + minGap * 2 + positionIconWidth,
                y: descriptionY,
                width: positionLength,
                lineHeight: 34,
                fontSize: 24,
                textAlign: 'left',
                zIndex: 10,
                baseLine: 'top'
            },
        )
        descImages.push(
            // position
            {
                url: position,
                x: positionIconStartsX,
                y: descriptionY + parseInt(minGap / 2), // 增加2个像素来对齐安卓位置图标
                height: 26,
                width: positionIconWidth,
                zIndex: 10,
            },
        )
    }
    return {
        descTexts,
        descImages
    }
}

// 处理标签
const handleTags = (threads) => {
  const {displayTag} = threads;
  if(typeof displayTag !== 'object' || !Object.values(displayTag).length) {
    return configObj;
  }

  // 增加标签
  let tagsSize = 0;
  const tagKeys = [];

  // 以下顺序要跟帖子中的顺序保持一致
  if(displayTag.isEssence) {
    tagKeys.push('isEssence');
    tagsSize += 1;
  }

  if(displayTag.isReward) {
    tagKeys.push('isReward');
    tagsSize += 1;
  }

  if(displayTag.isRedPack) {
    tagKeys.push('isRedPack');
    tagsSize += 1;
  }

  if(displayTag.isPrice) {
    tagKeys.push('isPrice');
    tagsSize += 1;
  }

  const rightPadding = posterPadding;
  const endPosition = posterWidth - rightPadding - posterFrameWidth;
  const itemWidthLong = 78;
  const itemWidthShort = 39;
  const itemsGap = minGap * 3;

  let pos = [
    endPosition - 4 * (itemWidthLong + itemsGap),
    endPosition - 3 * (itemWidthLong + itemsGap),
    endPosition - 2 * (itemWidthLong + itemsGap),
    endPosition - 1 * (itemWidthLong + itemsGap)]; // 从左到右标签的起始位置
  if(tagsSize > 2) {
    pos = [
      endPosition - 4 * (itemWidthShort + itemsGap),
      endPosition - 3 * (itemWidthShort + itemsGap),
      endPosition - 2 * (itemWidthShort + itemsGap),
      endPosition - 1 * (itemWidthShort + itemsGap)]; // 只有一个字的情况
  }

  const tags = [];
  for(let i = 0; i < tagsSize; i++) {
    const blockWidth = tagsSize > 2 ? 40 : 80;
    const tagBlock = { // 帖子标签的边框
      x: 580,
      y: nameAndTagsY - 8,
      width: blockWidth,
      height: 40,
      backgroundColor: "",
      opacity: 0.6,
      borderRadius: 16,
      borderWidth: 2,
      zIndex: 10,
      text: {
        text: '',
        color: '#ff0000',
        width: 100,
        height: 36,
        lineHeight: 24,
        fontSize: 24,
        lineNum: 1,
        baseLine: 'middle',
        textAlign: 'center',
        zIndex: 11,
      },
    };

    if(tagKeys[i] === "isEssence") {
      tagBlock.backgroundColor = 'rgba(246, 101, 36, 0.4)';
      tagBlock.borderColor = "#f66524";
      tagBlock.text.color = "#f66524";
      tagBlock.text.text = tagsSize > 2 ? '精' : '精华';
    }

    if(tagKeys[i] === "isReward") {
      tagBlock.backgroundColor = 'rgba(255, 195, 0, 0.4)';
      tagBlock.borderColor = "#ffc300";
      tagBlock.text.color = "#ffc300";
      tagBlock.text.text = tagsSize > 2 ? '悬' : '悬赏';
    }

    if(tagKeys[i] === "isRedPack") {
      tagBlock.backgroundColor = 'rgba(224, 36, 51, 0.4)';
      tagBlock.borderColor = "#e02433";
      tagBlock.text.color = "#e02433";
      tagBlock.text.text = tagsSize > 2 ? '红' : '红包';
    }

    if(tagKeys[i] === "isPrice") {
      tagBlock.backgroundColor = 'rgba(58, 193, 95, 0.4)';
      tagBlock.borderColor = "#3ac15f";
      tagBlock.text.color = "#3ac15f";
      tagBlock.text.text = tagsSize > 2 ? '付' : '付费';
    }

    const idx = i + (4 - tagsSize >= 0 ? 4 - tagsSize : 0)
    tagBlock.x = pos[idx < 4 ? idx : 3]; // 默认总共四个标签
    tags.push(tagBlock);
  }
  return tags;
}

