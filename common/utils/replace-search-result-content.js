import replaceStringInRegex from '@common/utils/replace-string-in-regex';


export default function replaceSearchResultContent(text) {

    text = '' + text;
    if (!text) return;

    let newText = replaceStringInRegex(text, "break", '');
    newText = replaceStringInRegex(newText, "heading", '');
    newText = replaceStringInRegex(newText, "paragraph", '');
    newText = replaceStringInRegex(newText, "imgButEmoj", '[图片]');
    newText = replaceStringInRegex(newText, "list", '');

    return `<p>${newText}</p>`;
}
  