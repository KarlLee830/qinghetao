/**
 * @param {function} fn 节流回调函数
 * @param {number} delay 节流时间
 */
const throttle = (fn, delay) => {
  let timer = null
  return function () {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, arguments)
        timer = null
      }, delay)
    }
  }
};


export default throttle;
