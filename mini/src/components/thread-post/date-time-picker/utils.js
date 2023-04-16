function padZero(num) {
  return `${num}`.padStart(2, '0');
}

export const formatDate = (year, month, day, hour, minute) => {
  return `${year}/${padZero(month)}/${padZero(day)} ${padZero(hour)}:${padZero(minute)}`;
};

// 获取当前时间
export const getDate = (value) => {
  let date = date = value ? new Date(value) : new Date();
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();
  const f = date.getMinutes();
  return formatDate(y, m, d, h, f);
};

//根据时间2021-04-24 23：12  得到 [2021, 04, 24, 23, 12]
export const getArrWithTime = (str) => {
  let arr = str.match(/\d+/g).map(item => parseInt(item));
  return arr;
};

// 获取对应年份月份的天数
export const getMonthDay = (year, month) => {
  var d = new Date(year, month, 0);
  return d.getDate();
};

// 获取当前年月下的天列表
export const getDayList = (year, month) => {
  const dayList = [];
  var d = getMonthDay(year, month);
  for (let i = 1; i <= d; i++) {
    dayList.push(i + "日");
  }
  return dayList;
};

// 获取当前时间的年、月、日、时、分集合
export const getPickerViewList = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const yearList = [];
  const monthList = [];
  const dayList = getDayList(year, month);
  const hourList = [];
  const minuteList = [];

  for (let i = 1970; i <= 2070; i++) {
    yearList.push(i + "年");
  }
  for (let i = 1; i <= 12; i++) {
    monthList.push(i + "月");
  }

  for (let i = 0; i <= 23; i++) {
    hourList.push(i + "点");
  }
  for (let i = 0; i <= 59; i++) {
    minuteList.push(i + "分");
  }
  return { yearList, monthList, dayList, hourList, minuteList };
};
