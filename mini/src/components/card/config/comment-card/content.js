import s9e from '@common/utils/s9e';
import replaceStringInRegex from '@common/utils/replace-string-in-regex';
import htmlparser2 from 'htmlparser2';
import { getByteLen, cutText } from '../../utils';



import {
  posterFrameWidth,
  baseLineHeight,
  maxContentHeight,
  imagesGap,
  posterPadding,
  commentWidth,
  screenHeight,
  baseX,
  contentWidth,
} from '../constants';

export const getContentConfig = ({ comment , baseHeight, hidePart }) => {
  const texts = handleTexts(comment,baseHeight , hidePart);
  const images =handleImagesArea(comment, texts.height, baseHeight, hidePart); // texts.height是：{ originalTextHeight, renderedTextHeight }
  const totalContentHeight = baseHeight+ texts.height + images.height.renderedImgHeight 

  const returnConfig = {
    height: totalContentHeight + 50,
    config: {
      texts: [ ...texts.texts,],
      images: [...images.images],
    },
  }
  return returnConfig;
};




const handleTexts = (comment, baseHeight ,hidePart) => {
  const content =[];
  const { Parser } = htmlparser2;
  const parse = new Parser({
    ontext(text) {
      content.push(text);
    },
    onclosetag(tagname) {
      // 处理换行
      if (tagname === 'br') {
        content.push('\n');
      }
    },
  });

  let commentText = s9e.parse(comment.content);
  commentText = replaceStringInRegex(commentText, 'code', '');
  commentText = replaceStringInRegex(commentText, 'img', '');

  parse.parseComplete(commentText);
  let contentStr = content.join('');

  // 统计有几个换行
  // const n = contentStr.length - contentStr.replace(/[\n]/g, '').length - 1;
  // 计算文本高度,计算有多少文字乘以文字宽度最后除以一行的宽度,再乘以一行的高度52
  // const contentHeight = (Math.ceil((getByteLen(contentStr) * 14) / commentWidth) + (n >= 0 ? n : 0)) * baseLineHeight;

  const { textLineNumber, n } = handleHeightAccuracy(contentStr);
  let allLine = textLineNumber + (n >= 0 ? n : 0);
  if( hidePart ){
    const maxLine = 10;
    if(allLine < maxLine ){
      contentStr = contentStr.slice(0, Math.ceil(contentStr.length/2)) + (contentStr.length > 1?'...':'')
    }else{
      contentStr = `${cutText(contentStr , contentWidth , maxLine)  }...`;
    }
    const { textLineNumber:curTextLineNumber, n:curN} = handleHeightAccuracy(contentStr);
    allLine = curTextLineNumber + (curN >= 0 ?  curN: 0);
  }
  const contentHeight = allLine * baseLineHeight;
 
  return {
    height: contentHeight,
    texts: [
      // 内容
      {
        text: contentStr,
        x: baseX,
        y: baseHeight,
        width: contentWidth,
        fontSize: 32,
        lineHeight: baseLineHeight,
        lineNum: allLine,
        textAlign: 'left',
        zIndex: 10,
        baseLine: 'top',
        color: '#0B0B37',
        fontFamily: 'PingFang SC',
      },
    ],
  };
};

const handleHeightAccuracy = (content) => {
  const date = new Date();
  const replaceTextSign = `${date.getTime()  }`;
  const contentArr = content.replace(/[\n]/g, replaceTextSign).split(replaceTextSign);
  let textLineNumber = 0;
  // 换行符个数
  const n = contentArr.length;
  // 将文本分段判断文本行数，每段文本末尾会有一个换行符被统计视为一行，所以每段文本最后一行不记录统计行数
  for (let i = 0; i < contentArr.length; i++) {
    if(contentArr[i]) {
      textLineNumber += Math.floor((getByteLen(contentArr[i]) * 16) / contentWidth);
    }
  }
  return { textLineNumber, n };
}


const handleImagesArea = (comment, textHeight , baseHeight, hidePart) => {
  let renderedImgHeight = 0;

  const images = [];
  let imgInfo = {};
  // 图片区域，返回一组图片url集合
  imgInfo = handleImage(comment, textHeight , hidePart);

  if (imgInfo?.imagesArray) {
    const {imagesArray} = imgInfo;
    for (let i = 0; i < imagesArray.length; i++) {
      const item = imagesArray[i];
      if (!item.url || item.url.match(/.gif|.webp/gi)) continue;

      const imageY =
        textHeight +
        renderedImgHeight +
        imagesGap + 20;

      const image = {
        url: item.url,
        width: contentWidth,
        height: item.height,
        y: imageY + baseHeight,
        x: baseX,
        borderRadius: 12,
        zIndex: 10,
      };

      renderedImgHeight += item.height + imagesGap;
      images.push(image);
    }
  }

  renderedImgHeight += baseLineHeight; // 图片底部增加一行高度

  const imagesHeight = { originalImageHeight: imgInfo.sumOfFilesHeight || 0, renderedImgHeight };

  return {
    height: imagesHeight,
    images: [
      // 图片
      ...images,
    ],
  };
};




// 处理图片，返回一组图片url和高度的集合
const handleImage = (comment, contentHeight ,hidePart) => {
  let imgArray = [];
  // 处理付费或无内容时的图片
  imgArray = comment.images;
  const imagesArray = [];
  const availableImageSpace = ( hidePart ? screenHeight : maxContentHeight ) - contentHeight;

  let sumOfFilesHeight = 0; // 根据帖子中的图片高度计算渲染多少个图，用于减少访问数量
  for (let i = 0; i < imgArray.length; i++) {
    const item = imgArray[i];
    const fileHeight =
      (item?.fileHeight || 0) * ((commentWidth - posterPadding * 2 - posterFrameWidth) / (item?.fileWidth || 0));

    if (item?.url.match(/.gif|.webp/gi)) continue; // 暂不支持gif和webp
    sumOfFilesHeight += fileHeight;
    if (sumOfFilesHeight <= availableImageSpace || i === 0) { // 超过最大长度的图片不需要处理，第一个图片是超长也需要
        imagesArray.push({
          height: fileHeight,
          url: item?.url || "",
        });
    }

  }

 

  return {
    sumOfFilesHeight,
    imagesArray,
  };
};


