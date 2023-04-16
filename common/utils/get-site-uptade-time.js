
/**
 * 获取与当前的时间差
 */

export const getSiteUpdateTime = function (startTime) {
  // 判断当前月天数
  function getDays (mouth, year) {
    let days = 30;
    if (mouth === 2) {
      days = year % 4 === 0 ? 29 : 28;
    } else if (
      mouth === 1
      || mouth === 3
      || mouth === 5
      || mouth === 7
      || mouth === 8
      || mouth === 10
      || mouth === 12
    ) {
      // 月份为：1,3,5,7,8,10,12 时，为大月.则天数为31；
      days = 31;
    }
    return days;
  }
  // 兼容ios
  const [siteTimer] = startTime.split(' ');
  const start = new Date(siteTimer)
  const end = new Date(Date.now())
  // 计算时间戳的差
  const diffValue = end - start;
  // 获取年
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();
  // 获取月
  const startMouth = start.getMonth() + 1;
  const endMouth = end.getMonth() + 1;
  // 获取日
  const startDay = start.getDate();
  const endDay = end.getDate();
  // 获取小时
  const startHours = start.getHours();
  const endHours = end.getHours();
  // 获取分
  const startMinutes = start.getMinutes();
  const endMinutes = end.getMinutes();
  // 获取秒
  const startSeconds = start.getSeconds();
  const endSeconds = end.getSeconds();
  // 相差年份月份
  const diffYear = endYear - startYear
  // 获取当前月天数
  const startDays = getDays(startMouth, startYear)
  const endDays = getDays(endMouth, endYear)
  const diffStartMouth = (
    startDays - (startDay + (((startHours * 60) + startMinutes + (startSeconds / 60)) / 60 / 24) - 1)
  ) / startDays;
  const diffEndMouth = (endDay + (((endHours * 60) + endMinutes + (endSeconds / 60)) / 60 / 24) - 1) / endDays;
  const diffMouth = parseInt(
    diffStartMouth + diffEndMouth + (12 - startMouth - 1) + endMouth + ((diffYear - 1) * 12), 10
  );

  const y = parseInt(Math.floor(diffMouth / 12 * 100) / 100, 10);
  const d = parseInt(diffValue / 1000 / 60 / 60 / 24, 10);
  if (y > 0) {
    return `${y}年前`
  }
  if (diffMouth > 0) {
    return `${diffMouth}个月前`;
  }
  if (d > 0) {
    return `${d}天前`;
  }
  return '刚刚';
}