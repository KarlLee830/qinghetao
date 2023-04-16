import { get } from '../../utils/get';
import setAccessToken from '../../utils/set-access-token';

export const COMMON_LOGIN_STORE_ERRORS = {
  NEED_BIND_USERNAME: {
    Code: 'common_0001',
    Message: '需要补充昵称',
  },
  NEED_COMPLETE_REQUIRED_INFO: {
    Code: 'common_0002',
    Message: '需要补充附加信息',
  },
  NEED_ALL_INFO: {
    Code: 'common_0003',
    Message: '需要补充昵称和附加信息',
  },
  NEED_BIND_WECHAT: {
    Code: -8000,
    Message: '需要绑定微信',
  },
};

export const BANNED_USER = -4009; // 禁用
export const REVIEWING = 2; // 审核
export const REVIEW_REJECT = -4007; // 审核拒绝

const captcha = null;

const throwFormattedError = (error) => {
  if (error.code) {
    throw error;
  }
};

const networkRequestCatcher = async () => {
  try {

  } catch (error) {
    throwFormattedError(error);
    throw {
      Code: '9999',
      Message: '网络错误',
    };
  }
};

const isExtFieldsOpen = (site) => {
  const { setSite: { openExtFields } = {} } = site.webConfig;
  return openExtFields === '1' ;
};


/**
 * 检查用户是否处于需要绑定昵称
 * @param {*} resp
 */
const checkCompleteUserInfo = (resp) => {
  const isMissNickname = get(resp, 'data.isMissNickname', false);
  const isMissRequireInfo = get(resp, 'data.userStatus') === 10;
  const accessToken = get(resp, 'data.accessToken', '');
  if (resp.code === -8000) { // 绑定微信时不需要先设置登录态
    return;
  }
  const uid = get(resp, 'data.uid', '');

  setAccessToken({
    accessToken,
  });
  if (isMissRequireInfo && isMissNickname) {
    throw {
      uid,
      ...COMMON_LOGIN_STORE_ERRORS.NEED_ALL_INFO,
    }
  }

  if (isMissNickname) {
    throw {
      uid,
      ...COMMON_LOGIN_STORE_ERRORS.NEED_BIND_USERNAME,
    }
  }

  if (isMissRequireInfo) {
    throw {
      uid,
      ...COMMON_LOGIN_STORE_ERRORS.NEED_COMPLETE_REQUIRED_INFO,
    }
  }
};

/**
 * 检查用户是否处于需要调整状态页
 * @param {*} resp
 */
const checkUserStatus = (resp) => {
  checkCompleteUserInfo(resp);
  if (resp.code === 0 || resp.code === BANNED_USER || resp.code === REVIEW_REJECT) {
    let { code } = resp;

    const status = get(resp, 'data.userStatus', 0);
    const uid = get(resp, 'data.uid', '');
    if (code === 0 && status ===  REVIEWING) {
      const accessToken = get(resp, 'data.accessToken', '');
      setAccessToken({
        accessToken,
      });
      code = status;
    }

    if (code) {
      const rejectReason = get(resp, 'data.rejectReason', '') || get(resp, 'data.banReason', '');
      throw {
        Code: code,
        Message: rejectReason,
        uid
      };
    }
  }
};


export { throwFormattedError, networkRequestCatcher, checkCompleteUserInfo, checkUserStatus, isExtFieldsOpen };
