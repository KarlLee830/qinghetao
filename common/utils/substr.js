/**
 * 截取指定长度的中英文混合字符串
 * @param  {String} str 待截取的字符串
 * @param  {Number} n   截取长度（中文字符为英文的 double）
 * @return {String}     截取后的字符串
 */
export const substr = (str, n) => {
  const r = /[^\x00-\xff]/g;
  let m;

  if (str.replace(r, '**').length > n) {
    m = Math.floor(n / 2);

    for (let i = m, l = str.length; i < l; i++) {
      if (str.substr(0, i).replace(r, '**').length >= n) {
        return str.substr(0, i);
      }
    }
  }

  return str;
};
