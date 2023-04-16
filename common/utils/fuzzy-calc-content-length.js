import replaceStringInRegex from '@common/utils/replace-string-in-regex';
//
/**
 * 计算帖子内容的长度，用于是否激活“查看更多”
 * 逻辑：
 * 1. lengthInLine代表一行能有多少字
 * 2. Emoj是用<img ... class="qq-emotion" .../> 表示的，算作1.5个字
 * 3. 图片的<img>算作是四行字的长度，要考虑Emoj的情况
 * 4. 对于回车符，回车之后的长度要计算在内
 * 5. <img>会被替换成[图片]以便计算字数
*/
export default function fuzzyCalcContentLength(content, lengthInLine = 50) {
    content = '' + content;
    if (!content || content === '') return 0;

    let _content = content;

    const EMOJ_SIZE = 1.5;
    const IMG_DEFAULT_HEIGHT = lengthInLine * 6;
    const countEmojs = (_content?.match(/qq-emotion/g) || []).length;

    // 替换表情标签
    let newContent = replaceStringInRegex(_content, "emoj", '');

    const links = getImgLinksFromText(newContent);
    let totalImgHeight = 0;
    for(let i = 0; links?.length && i < links.length; i++) {
        if (typeof Image === "undefined") {
            totalImgHeight +=  IMG_DEFAULT_HEIGHT;
        } else {
            const imgObj = new Image();
            imgObj.src = links[i];
            totalImgHeight += imgObj?.height || IMG_DEFAULT_HEIGHT;
        }
    }

    // 替换图片标签
    newContent = replaceStringInRegex(newContent, "img", '');

    // 把代码块中的<br>换成*br*从而不参与计算长度，并换回占位符，回车换成'\n'
    newContent = replaceStringInRegex(newContent, "breakInCode", '*br*');
    newContent = replaceStringInRegex(newContent, "break", '\n');

    // 替换所有标签
    newContent = replaceStringInRegex(newContent, "tags", '');

    let totalCount = EMOJ_SIZE * countEmojs; // 表情大小
    totalCount += parseInt(totalImgHeight / 16) * lengthInLine; // 16个像素算是一行

    if(!newContent || newContent === '') return parseInt(totalCount);
    totalCount += newContent.length;
    const countReturns = (newContent.match(/\n/g) || []).length; // 匹配回车符

    for(let i = 0; i < countReturns; i++) {
        if(newContent.indexOf('\n') >= 0) {
            const restInLine = lengthInLine - newContent.indexOf('\n') > 0 ? // 防止长文章最后一个字是回车
                                lengthInLine - newContent.indexOf('\n') : 0;
            totalCount += restInLine;
            newContent = newContent.substr(newContent.indexOf('\n') + 1);
        }
    }

    return parseInt(totalCount);
}

function getImgLinksFromText(text) {
    const links = [];
    const images = text.match(/<img[\s]+[^<>]*>/gi);  //筛选出所有的image

    for (let i = 0; images?.length && i < images.length; i++) {

        if(images[i].indexOf("src=") !== -1) {
            const link = images[i].match(/src=[\'\"]?([^\'\"]*)[\'\"]?/g)[0].substr(5); // 移除src="
            links.push(link.substr(0, link.length - 1)); // 移除最后一个"
        }
    }
    return links;
}