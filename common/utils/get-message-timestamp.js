/**
* 私聊消息按时间分区
* @param list 私聊消息列表，时间按升序传入
* 时间规则：
* 1 当天消息，以每5分钟一个跨度，显示 (消息时间)
* 2 消息超过一天、小于一周，显示 (星期 + 消息时间)
* 3 消息大于1周，显示 (日期 + 消息时间)
*/
export const getMessageTimestamp = (list) => {
  if (list.length === 0) return list;

  const weeks = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const storageTime = []; // 存储已分区时间信息
  const interval = 5 * 60 * 1000; // 时间分区跨度 5分钟
  const today = new Date(new Date().toLocaleDateString()); // 当天凌晨
  const diffTimes1 = today.getTime(); // 当天凌晨的时间毫秒数
  const diffTimes2 = diffTimes1 - 6 * 24 * 60 * 60 * 1000  // 一周前凌晨时间毫秒数

  const handleTimestamp = (curTimestamp) => {
    const time = curTimestamp.replace(/-/g, '/'); // 兼容IOS时间字符串格式
    const currentTimes = Date.parse(time); // 需处理的时间毫秒数

    const prevTimes = storageTime.length > 0
      ? storageTime[storageTime.length - 1].timestamp
      : (currentTimes - 600000); // 上一个存储分区的时间戳
    const isBeyond = currentTimes - prevTimes > interval; // 相邻消息时间是否超出分区时间

    // 1 大于1周
    if (isBeyond && currentTimes < diffTimes2) {
      return {
        timestamp: currentTimes,
        showText: curTimestamp.substr(0, 16),
      };
    }
    // 2 大于1天
    if (isBeyond &&  currentTimes < diffTimes1) {
      const week = new Date(time).getDay();
      return {
        timestamp: currentTimes,
        showText: weeks[week] + curTimestamp.substr(10, 6),
      };
    }
    // 3 当天
    if (isBeyond) {
      return {
        timestamp: currentTimes,
        showText: curTimestamp.substr(11, 5),
      };
    }

    // 相邻在5分钟之内的消息,不用展示
    return {
      timestamp: "",
      showText: "",
    };

  }

  return list.map(item => {
    const timestampObj = handleTimestamp(item.timestamp)
    timestampObj.showText && storageTime.push(timestampObj)

    return {
      ...item,
      timestamp: timestampObj.showText,
    }
  });
}