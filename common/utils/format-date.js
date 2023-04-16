export const formatDate = (date, fmt) => {
  const _date = new Date(date);
  const o = {
    'M+': _date.getMonth() + 1,
    'd+': _date.getDate(),
    'h+': _date.getHours(),
    'm+': _date.getMinutes(),
    's+': _date.getSeconds(),
    'q+': Math.floor((_date.getMonth() + 3) / 3),
    S: _date.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (`${_date.getFullYear()}`).substr(4 - RegExp.$1.length));
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt.replace(RegExp.$1, `${o[k]}`.padStart(2, '0'));
    }
  }
  return fmt;
};