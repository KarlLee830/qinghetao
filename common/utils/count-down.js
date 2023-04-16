/**
 * 获取截止时间距离开始时间的剩余时间
 *
 * @example
 *  var e = '2018-10-31 12:00:00'
 *  var s = '2018-10-23 11:00:00'
 *  console.log(getRemainTime(e, s)) // {remain: 695410000, days: 8, seconds: 10, minutes: 10, horus: 1}
 *
 * @export
 * @param {timestamp|Date string} etime 截止时间
 * @param {timestamp|Date string} stime 开始时间，默认为当前时间
 * @return {object} 剩余时间对象
 */
export function getRemainTime(etime, stime) {
  const endtime = new Date(etime).getTime();
  stime = stime ? new Date(stime).getTime() : new Date().getTime();
  let remain = endtime - stime;
  if (remain <= 0) remain = 0;
  const seconds = Math.floor(remain / 1000 % 60) || 0;
  const minutes = Math.floor(remain / (1000 * 60) % 60) || 0;
  const hours = Math.floor(remain / (1000 * 60 * 60) % 24) || 0;
  const days = Math.floor(remain / (1000 * 60 * 60 * 24)) || 0;
  return {
    remain, // 剩余的毫秒数
    days, // 剩余的天数
    seconds, // 剩余的秒数
    minutes, // 剩余的分钟数
    hours, // 剩余的小时数
  };
}

/**
 * 倒计时
 *
 * @class CountDown 倒计时
 * @example
 *  var cdown = new CountDown()
 *  cdown.start(new Date().getTime() + 10 * 1000, (res) => {
 *    console.log(res)
 *  })
 *  cdown.stop()
 */
export default class CountDown {
  constructor() {
    this.__ang_cdown_timer = null;
  }
  /**
   * 倒计时
   * 截止时间距离当前时间的倒计时
   * @param {timestamp|Date string} etime 结束时间
   * @param {funciton} callback 回调函数
   */
  start(etime, callback) {
    const remain = getRemainTime(etime);
    if (remain.remain > 0) {
      if (typeof callback === 'function') callback(remain);
      this.__ang_cdown_timer = setTimeout(() => {
        this.start(etime, callback);
      }, 1000);
    } else {
      clearTimeout(this.__ang_cdown_timer);
      if (typeof callback === 'function') callback(remain);
    }
  }
  /**
   * 暂停倒计时
   */
  stop() {
    clearTimeout(this.__ang_cdown_timer);
  }
}
