import logoImg from '../../../public/dzq-img/admin-logo-x2.png'
import {  posterWidth, nameAndTagsY, avatarWidth, descriptionStartsX, baseX, minGap } from './constants';
import Taro from '@tarojs/taro';

export const getHeaderConfig = async ({data, user, siteName}) => {
    const {setSite} = data.webConfig || ''
    const {avatarBlock, avatarImage} = handleAvatar(user);
    const nicknameText = handleNickname(user)
    const sitenameText = handleSiteName(siteName)
    const logo = await handleLogo(setSite)
    const siteInfo = handleSiteInfo(data)
    const bgc = handleBgc(setSite)
    const headerConfig = {
        height: 364,
        config: {
            texts: [
                // 昵称
                nicknameText,
                sitenameText,
                ...siteInfo
            ],
            blocks: [],
            images: [
                logo
            ]
        }
    }
    if (setSite?.siteBackgroundImage) {
        headerConfig.config.images.push(bgc)
    } else {
        headerConfig.config.blocks.push(bgc)
    }
    if(!user.userInfo.avatarUrl) {
        headerConfig.config.blocks.push(avatarBlock);
      } else {
        headerConfig.config.images.push(avatarImage);
    }
    return headerConfig
}

// 处理背景图片
const handleBgc = (setSite) => {
    if (setSite?.siteBackgroundImage) {
        return {
            url: setSite.siteBackgroundImage,
            x: 0,
            y: 0,
            width: posterWidth,
            height: 364,
            borderColor: '#fff',
            zIndex: 10
        };
    }
    return {
        x: 0,
        y: 0,
        width: posterWidth,
        height: 364,
        borderColor: '#fff',
        backgroundColor: '#2469f6',
        zIndex: 10
    }
}

// 有头像地址时，处理头像
const handleAvatar = (user) => {
    const avatar = user.userInfo?.avatarUrl || ''
    let avatarBlock = {};
    let avatarImage = {};
    if(!avatar) {
      avatarBlock = getAvatarBlock(user);
    } else {
      avatarImage = getAvatarImage(user);
    }
    return {
      avatarBlock,
      avatarImage
    }
  }
  
  // 无头像地址时处理头像
  const getAvatarBlock = (user) => {
    const {nickname} = user.userInfo || ''
    const name = nickname.charAt(0)
    return {
      x: baseX,
      y: nameAndTagsY,
      width: avatarWidth,
      height: 76,
      borderRadius: 76,
      borderColor: '#fff',
      borderWidth: 2,
      backgroundColor: '#8590a6',
      text: {
        text: name,
        color: '#fff',
        fontSize: 28,
        lineHeight: 28,
        textAlign: 'center',
        baseLine: 'middle',
        zIndex: 20,
        fontFamily: 'PingFang SC',
        width: avatarWidth - minGap * 6,
      },
      zIndex: 20,
    }
  }
  
  // 处理头像
  const getAvatarImage = (user) => {
      const avatar = user.userInfo.avatarUrl || ''
      return {
          url: avatar,
          x: baseX,
          y: nameAndTagsY,
          width: avatarWidth,
          height: avatarWidth,
          borderRadius: 76,
          borderColor: '#fff',
          borderWidth: 2,
          zIndex: 20,
      }
  }
  
  // 处理昵称
  const handleNickname = (user) => ({
      text: `${user.userInfo.nickname || ''} 推荐`,
      color: '#fff',
      x: descriptionStartsX,
      y: nameAndTagsY,
      width: 600,
      lineHeight: 40,
      fontSize: 28,
      textAlign: 'left',
      zIndex: 20,
      baseLine: 'top',
    })
  // 处理站点名称
  const handleSiteName = (siteName) => ({
        text: siteName,
        x: descriptionStartsX,
        y: nameAndTagsY + 76,
        width: 600,
        lineNum: 1,
        color: '#fff',
        fontSize: 24,
        textAlign: 'left',
        zIndex: 20,
        baseLine: 'bottom',
    })
// 处理图片logo地址
const handleLogo = async (setSite) => {
    let logoUrl =  logoImg;
    if (setSite?.siteHeaderLogo) {
        logoUrl = setSite.siteHeaderLogo;
    }
    const height = 70
    const width = 444
    const imgInfo = await new Promise((resolve, reject) => {
        Taro.getImageInfo({
            src: logoUrl,
            success: (res) => {
                resolve(res)
            }
        })
    })
    const imgWidth = imgInfo.width * height / imgInfo.height
    return {
        url: logoUrl,
        x: 355 - imgWidth / 2,
        y: 166,
        height: 70,
        width: imgWidth,
        zIndex: 20,
    }
}

// 处理站点信息
const handleSiteInfo = (data) => {
    const {webConfig} = data
    const siteInfo = {
        countUsers: 0,
        countThreads: 0,
      };
    if (webConfig && webConfig.other) {
        siteInfo.countUsers = webConfig.other.countUsers;
        siteInfo.countThreads = webConfig.other.countThreads;
    }
    return [
        {
            text: '成员',
            x: 150,
            y: 280,
            color: '#fff',
            opacity: 0.6,
            fontSize: 32,
            textAlign: 'left',
            zIndex: 20,
            baseLine: 'top',
        },
        {   

            text: `${siteInfo.countUsers}`,
            x: 230,
            y: 280,
            color: '#fff',
            fontSize: 32,
            textAlign: 'left',
            zIndex: 20,
            baseLine: 'top',
        },
        {
            text: '内容',
            x: 398,
            y: 280,
            color: '#fff',
            opacity: 0.6,
            fontSize: 32,
            textAlign: 'left',
            zIndex: 20,
            baseLine: 'top',
        },
        {   

            text: `${siteInfo.countThreads}`,
            x: 478,
            y: 280,
            color: '#fff',
            fontSize: 32,
            textAlign: 'left',
            zIndex: 20,
            baseLine: 'top',
        }
    ]
}