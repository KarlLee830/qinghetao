export const trimLR = (str) => {
  //去掉首尾空格
  return (str || "").replace(/(^\s*)|(\s*$)/g, '')
}