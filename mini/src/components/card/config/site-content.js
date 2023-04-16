import titleImg from '../card-img/title.jpg'
import { getByteLen } from '../utils';
import rectangle from '../card-img/rectangle.png'
import { posterWidth } from './constants';
import lookMore from '../card-img/look-more.jpg';
import browser from '../../../../../common/utils/browser'

export const getContentConfig = ({baseHeight, data}) => {
    const maxLineNum = 60 // 最大高度1900，最大行数60行
    const Title = handleTitle(baseHeight)
    const line = handleLines(baseHeight)
    const TitleImg = handleTitleImg(baseHeight)
    const {config: introduction, height: contentHeight} = handleSiteIntroduction(data, baseHeight, maxLineNum)
    const contentConfig = {
        height: 142 + contentHeight,
        config: {
            texts: [
                Title,
                introduction
            ],
            blocks: [],
            images: [
                TitleImg
            ],
            lines: [
                line
            ]
        }
    } 
    if(contentHeight / 48 >= maxLineNum) {
        const {rectangleConfig, lookmoreConfig} = handleOverHeight(baseHeight ,contentHeight)
        contentConfig.config.images.push(rectangleConfig)
        contentConfig.config.images.push(lookmoreConfig)
        contentConfig.height += 40
    }
    return contentConfig
}
// 返回站点介绍
const handleTitle = (baseHeight) => {
    // 站点介绍距离上方的距离
    const titleHeight = 32
    return {
        text: '站点介绍',
        y: baseHeight + titleHeight,
        x: 76,
        fontFamily: "PingFang SC Semibold",
        fontSize: 32,
        lineHeight: 48,
        textAlign: 'left',
        color: '#0b0b37',
        zIndex: 20,
        baseLine: 'top',
    }
}
// 返回站点介绍前的图片
const handleTitleImg = (baseHeight) => {
    // 站点介绍距离上方的距离
    const titleHeight = 32
    let offset = 0
    if(browser.env('android')) {
        offset = 3
      }
    return {
        url: titleImg,
        x: 32,
        y: baseHeight + titleHeight + 3 + offset,
        width: 28,
        height: 32,
        zIndex: 10,
    }
}
// 站点信息下边的线
const handleLines = (baseHeight) => {
    const lineHeight = 108
    return {
        startX: 32,
        startY: lineHeight + baseHeight,
        endX: posterWidth - 32,
        endY: lineHeight + baseHeight,
        width: 2,
        color: '#eee'
    }
}
// 处理站点介绍，
const handleSiteIntroduction = (data, baseHeight, maxLineNum) => {
    const textHeight = 146
    let {siteIntroduction = ''} = data.webConfig?.setSite
    const contentWidth = posterWidth - 64
    if(!siteIntroduction) {
        // siteIntroduction = '暂无介绍'
        siteIntroduction =`来这里，发现更多精彩内容！`
    }
    const length = getByteLen(siteIntroduction) * 14
    let lineNum = Math.ceil(length / contentWidth)
    if(lineNum > maxLineNum) {
        lineNum = maxLineNum
    }
    return {
        height: lineNum * 48,
        config: {
        text: siteIntroduction ,
        y: textHeight + baseHeight,
        x: 32,
        width: contentWidth,
        fontFamily: "PingFangSC-Regular ",
        fontSize: 28,
        lineHeight: 48,
        textAlign: 'left',
        color: '#0b0b37',
        baseLine: 'top',
        lineNum
        }
    }
}
// 处理高度超过1900的情况
const handleOverHeight = (baseHeight ,contentHeight) => {
    // 一行的行高为48
    const lineHeight = 48
    // 站点介绍文字距离上方距离
    const textHeight = 146
    return {
        rectangleConfig: {
            url: rectangle,
            x: 0,
            y: textHeight + baseHeight + contentHeight - 2 * lineHeight,
            width: posterWidth,
            height: 2 * lineHeight,
            zIndex: 20,
        },
        lookmoreConfig: {
            url: lookMore,
            height: 40,
            width: 260,
            x: 236,
            y: textHeight + baseHeight + contentHeight,
            zIndex: 10,
        }
    }
}