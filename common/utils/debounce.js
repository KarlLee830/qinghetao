/**
 * 防抖函数
 * @param {function} fn 防抖回调函数
 * @param {number} delay 防抖时间
 */
const debounce = (fn, delay) => {
  let timer = null;
  return function () {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, arguments);
      timer = null;
    }, delay);
  };
};

export default debounce;
