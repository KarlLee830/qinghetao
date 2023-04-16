/**
 * 对于编辑的帖子因为后台传递的标签内容问题，所以要和插入表情时的alt保持一致
 */
export const emojiFromEditFormat = text => text.replace(/alt="(\w+)"/g, 'alt=":--$1:dzqemoji"');

/**
 * 插入表情时因编辑器原因需要单独处理表情进行展示
 * @param {string} text 文本
 */
export const emojiVditorCompatibilityDisplay = text => text.replace(/alt=":(\w+):dzqemoji"/g, 'alt=":--$1:dzqemoji"');

/**
 * 还原标签的alt表情，准备提交给后台使用
 * @param {string} text 文本
 */
export const emojiFormatForCommit = text => text.replace(/alt=":--(\w+):dzqemoji"/g, 'alt=":$1:emoji"');
