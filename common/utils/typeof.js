/**
 * 判断变量类型
 * @param {any} s 传入的变量
 * @param {string} typeString 类型
 */
function isType(s, typeString) {
  return {}.toString.call(s) === `[object ${typeString}]`;
}

export default {
  isObject: function isObject(s) {
    return isType(s, 'Object');
  },
  isArray: function isArray(s) {
    return Array.isArray(s);
  },
  isString: function isString(s) {
    return isType(s, 'String');
  },
  isNumber: function isNumber(s) {
    return isType(s, 'Number');
  },
  isFunction: function isFunction(s) {
    return isType(s, 'Function');
  },
  isUndefined: function isUndefined(s) {
    return isType(s, 'Undefined');
  },
  isNull: function isNull(s) {
    return isType(s, 'Null');
  },
  isRegExp: function isRegExp(s) {
    return isType(s, 'RegExp');
  },
  isEmptyObject: function isEmptyObject(s) {
    // eslint-disable-next-line no-restricted-syntax
    for (const name in s) {
      return false;
    }
    return true;
  },
};
