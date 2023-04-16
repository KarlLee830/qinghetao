import xss from 'xss';
// const xss = {};

// 自定义白名单
xss.whiteList.img = ['src', 'alt', 'title', 'width', 'height', 'class'];
xss.whiteList.button = ['class'];
xss.whiteList.input = ['data-task-id', 'type', 'disabled'];
xss.whiteList.ul = ['class'];
xss.whiteList.li = ['class', 'data-task-state'];
xss.whiteList.span = ['class'];
xss.whiteList.iframe = ['src', 'alt', 'title', 'width', 'height', 'class']

export default xss;
