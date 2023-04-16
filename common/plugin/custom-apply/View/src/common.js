import { formatDate } from '@common/utils/format-date';

const getTime = time => formatDate(time, 'yyyy-MM-dd hh:mm:ss');
const getDateTime = (time) => {
  if (time) return new Date(time?.replace(/-/g, '/'));
  return time;
};

// 获取提交数据
export const getPostData = (body, tomId) => {
  const {
    activityStartTime,
    activityEndTime,
    title,
    content,
    actPlace,
    totalNumber,
    additionalInfoType,
  } = body;
  const registerStartTime = body.registerStartTime ? body.registerStartTime : body.activityStartTime;
  const registerEndTime = body.registerEndTime ? body.registerEndTime : body.activityEndTime;

  let result = {
    title,
    content,
    totalNumber: totalNumber ? parseInt(totalNumber, 10) : 0, // 0 代表不限制
    activityStartTime: getTime(activityStartTime),
    activityEndTime: getTime(activityEndTime),
    registerStartTime: getTime(registerStartTime),
    registerEndTime: getTime(registerEndTime),
    additionalInfoType,
  };
  if (actPlace) result = { ...result, position: {
    address: actPlace,
    location: actPlace,
    longitude: 0,
    latitude: 0,
  } };
  return {
    tomId,
    body: result,
  };
};

// 对插件数据进行格式化便于编辑
export const formatPostData = (body) => {
  const {
    activityStartTime,
    activityEndTime,
    registerStartTime,
    registerEndTime,
    title,
    content,
    totalNumber,
    position,
    additionalInfoType,
  } = body;
  return {
    activityStartTime: getDateTime(activityStartTime),
    activityEndTime: getDateTime(activityEndTime),
    registerStartTime: getDateTime(registerStartTime),
    registerEndTime: getDateTime(registerEndTime),
    title,
    content,
    actPlace: position?.location || '',
    totalNumber: totalNumber === 0 ? '' : totalNumber,
    actPeopleLimitType: totalNumber === 0 ? 0 : 1,
    additionalInfoType,
  };
};

// 报名附加信息
export const ATTACH_INFO_TYPE = {
  name: 1,
  mobile: 2,
  weixin: 3,
  address: 4,
};

export const ATTACH_INFO_NAME = {
  [ATTACH_INFO_TYPE.name]: {
    value: '姓名',
    key: 'name',
  },
  [ATTACH_INFO_TYPE.mobile]: {
    value: '手机号',
    key: 'mobile',
  },
  [ATTACH_INFO_TYPE.weixin]: {
    value: '微信号',
    key: 'weixin',
  },
  [ATTACH_INFO_TYPE.address]: {
    value: '联系地址',
    key: 'address',
  },
};
