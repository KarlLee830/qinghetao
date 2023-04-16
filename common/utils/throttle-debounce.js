/**
 * 对常用的限频限流函数，节流Throttle以及防抖Debounce进行封装
 *
 * Throttle: 防止delay时间内对同一事件多次触发，只有在delay之后执行该事件，可能被多次执行
 * Debounce: 在delay时间内被多次触发的事件会被重置计数器，delay之后只执行一次
 *
 * @param  {function}  callback - Required. 需要执行的回调函数
 * @param  {number}    delay -    毫秒，通常100-250。delay之后出触发执行回调函数
 *
 *
 * @returns {function}  throttle
 */
const throttle = function (callback, delay) {

  if( (!callback && typeof callback !== "function") ||
      typeof delay !== "number") {
      console.error("The argument has the types in error.");
      return;
  }

  let elapsed = 0;
  return function(...args) {
    const now = new Date().valueOf();
    if(now - elapsed > delay) {
      callback(...args);
      elapsed = now;
    }
  }
}

/**
 *
 * @param  {function} callback - Required. 需要执行的回调函数
 * @param  {number}   delay -    毫秒，通常100-250。delay之后出触发执行回调函数
 *
 */
const debounce = (callback, delay) => {

  if( (!callback && typeof callback !== "function") ||
      typeof delay !== "number") {
    console.error("The argument has the types in error.");
    return;
  }
  let timeoutID = null;
  return function (...args) {
    if(timeoutID !== null) {
      clearTimeout(timeoutID);
    }
    timeoutID = setTimeout(() => {
      callback(...args);
    }, delay);
  }
}

export { throttle, debounce };
