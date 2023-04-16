export default function replaceStringInRegex(text, type, newSubstr) {

  if(!text) return text;
  if (typeof text !== "string" ||
      typeof type !== "string" ||
      typeof newSubstr !== "string") {
    console.error("变量类型错误。");
    return text;
  }

  let newText = text;
  switch (type) {
    case "emoj":
      newText = newText.replace(/<img[\s]+[^<>]*class=([^<>]+qq\-emotion)(?:\"|\')[^<>]*>/g, newSubstr);
      newText = newText.replace(/<image[\s]+class=([^\/]*qq\-emotion[^\/]*)(?:\"|\')[^\/]*<\/image>/g, newSubstr);
      break;
    case "img":
      newText = newText.replace(/<img[\s]+[^<>]*>|<img[\s]+[^<>]*/g, newSubstr);
      break;
    case "imgButEmoj":
      let emojArray = newText.match(/<img[\s]+[^<>]*class=([^<>]+qq\-emotion)(?:\"|\')[^<>]*>/g) || []; // 找到所有emoj
      const EMOJ_PLACEHOLDER = '#$#emoj#$#';

      let noEmojText = newText.replace(/<img[\s]+[^<>]*class=([^<>]+qq\-emotion)(?:\"|\')[^<>]*>/g, EMOJ_PLACEHOLDER);
      noEmojText = noEmojText.replace(/<img[\s]+[^<>]*>|<img[\s]+[^<>]*/g, newSubstr); // 更换图片到需要的string

      // 更换emoj的img标签到emoj标签
      for(let i = 0; i < emojArray.length; i++) {
        noEmojText = noEmojText.replace(EMOJ_PLACEHOLDER, emojArray[i]);
      }

      if(noEmojText.indexOf(EMOJ_PLACEHOLDER) !== -1) { // 兜底，避免错过一些emoj
        newText = newText.replace(/<img[\s]+[^<>]*class=([^<>]+qq\-emotion)(?:\"|\')[^<>]*>/g, '[表情]');
      } else {
        newText = noEmojText;
      }
      break;
    case "break":
      newText = newText.replace(/<br[^<>]*>/g, newSubstr);
      newText = newText.replace(/<view[\s]+class=([^\/]*dzq\-br[^\/]*)(?:\"|\')[^\/]*<\/view>/g, newSubstr);
      break;
    case "breakInCode":
      let codeBlocks = newText.match(/<code>[\s\S]*?<\/code>/g) || []; // 找到代码块
      const CODE_PLACEHOLDER = `#$#break#$#`;
      let noCodeText = newText.replace(/<code>[\s\S]*?<\/code>/g, CODE_PLACEHOLDER); // 用占位符替代代码块
      for(let i = 0; i < codeBlocks.length; i++) {
        noCodeText = noCodeText.replace(CODE_PLACEHOLDER, codeBlocks[i].replace(/<br[^<>]*>/g, newSubstr));
      }
      newText = noCodeText;
      break;
    case "tags":
      newText = newText.replace(/<[^<>]*>|<\/[^<>]*>/g, newSubstr);
      break;
    case "heading":
      newText = newText.replace(/<h[0-9][^\/\>]*>|<\/h[0-9]>/g, newSubstr);
      break;
    case "headingWithContent":
      // 包括标签内文字
      newText = newText.replace(/<h[0-9][^\/]*[^\<\/]<\/h[0-9]>/g, newSubstr);
      break;
    case "paragraph":
      newText = newText.replace(/<p[\s]?[^\/\>]*>|<\/p>/g, newSubstr);
      break;
    case "list":
      newText = newText.replace(/<ol[^<>]*>|<(ul|li)[^<>]*>/g, newSubstr);
      newText = newText.replace(/<\/(li|ul|ol)>/g, newSubstr);
      break;
    case "code":
      newText = newText.replace(/<code>[\s\S]*?<\/code>/g, newSubstr);
      newText = newText.replace(/<pre>[\s\S]*?<\/pre>/g, newSubstr);
      break;
    case "emotion":
      newText = newText.replace(/:[0-9A-Za-z]{2,20}:/g, newSubstr)
      break;
    default:
      break;
  }

  return newText;


}
