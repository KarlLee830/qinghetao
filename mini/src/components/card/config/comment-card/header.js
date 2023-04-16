import {  nameAndTagsY, avatarWidth, userInfoHeight, descriptionStartsX, descriptionY, baseX, minGap } from '../constants';

export const getHeaderConfig = ({ comment }) => {
    const {avatarBlock, avatarImage} = handleAvatar(comment);
    const nicknameText = handleNickname(comment);
    const createTime = handleTime(comment);
    const headerConfig = {
      height: userInfoHeight,
      config: {
          texts: [
            // 昵称
            nicknameText,
            createTime,
          ],
          images: [],
          blocks: [],
      }
    };
    if(!comment.user.avatar) {
      headerConfig.config.blocks.push(avatarBlock);
    } else {
      headerConfig.config.images.push(avatarImage);
    }

    return headerConfig;
}


const handleTime = comment => {
  return    {
    text: comment.createdAt,
    color: '#8590A6',
    x: descriptionStartsX,
    y: descriptionY,
    width: comment.createdAt.length*15 + minGap * 4,
    lineHeight: 34,
    fontSize: 24,
    textAlign: 'left',
    zIndex: 20,
    baseLine: 'top'
  }
}

// 处理头像
const handleAvatar = (comment) => {
  const avatar = comment.user.avatar || ''
  let avatarBlock = {};
  let avatarImage = {};
  if(!avatar) {
    avatarBlock = getAvatarBlock(comment);
  } else {
    avatarImage = getAvatarImage(comment);
  }
  return {
    avatarBlock,
    avatarImage
  }
}

// 处理头像
const getAvatarBlock = (comment) => {
  const {nickname} = comment.user
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
const getAvatarImage = (comment) => {
    const avatar = comment.user.avatar || ''
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
const handleNickname = (comment) => {
  const nickname = comment.user.nickname || ''
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





