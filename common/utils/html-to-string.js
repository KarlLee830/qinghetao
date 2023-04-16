// 替换所有html表情以及换行符，主要用于分享或者设置title
export default function htmlToString(string) {
    const reg=/(<\/?.+?\/?>)|\n/g;
    return string.replace(reg,'');
}