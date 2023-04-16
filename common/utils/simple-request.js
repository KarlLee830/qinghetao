import * as server from '@server';


/**
   * 使用请求（简单处理报错）
   * @param {*} method 请求方法名
   * @param {*} params 参数
   */
export const simpleRequest = async (method, params) => {
  try {
    const res = await server[method](params);

    if (res.code === 0) {
      return res.data;
    }

    throw {
      Code: res.code,
      Message: res.msg,
    };
  } catch (error) {
    if (error.Code) {
      throw error;
    }
    throw {
      Code: 'ulg_9999',
      Message: '网络错误',
      error,
    };
  }
};
