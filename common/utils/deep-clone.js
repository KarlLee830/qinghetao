/**
 * 深拷贝
 * @param obj 要拷贝的对象
 * @param options 可以配置ignore数组设置忽略的项目
 * ```js
 *   const a = { a: { b: 1 } };
 *   const c = deepClone(a);
 * ```
 */
const deepClone = (obj, options) => {
  const o = obj.constructor === Array ? [] : {};
  for (const i in obj) {
    if (options?.ignore && options.ignore.indexOf(i) >= 0) {
      continue;
    }
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(i)) {
      o[i] = obj[i] && typeof obj[i] === 'object' ? deepClone(obj[i]) : obj[i];
    }
  }
  return o;
};
export default deepClone;
