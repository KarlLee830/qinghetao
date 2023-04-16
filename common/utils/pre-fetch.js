/**
 * 列表数据预加载
 * 1. 数据加载时机
 * 2. 数据渲染时间
 * 3. 边界兜底机制
 * 4. 数据清空时机
 *
 * @param {*} param.fetch 请求数据的方法
 * @returns
 */
const createPreFetch = ({ fetch, size = 1 }) => {
  let dataMap = {};
  let isLoading = false;

  // 清除指定数据
  const clearIndex = (index) => {
    if (dataMap[index]) {
      delete dataMap[index];
    }
  };

  // 清空所有数据
  const clearAll = () => {
    dataMap = {};
  };

  /**
   * 取数据
   * @param {*} index
   * @returns {Promise}
   */
  const getData = (params) => {
    const { index } = params;
    if (dataMap[index]) {
      console.log('获取预请求的数据', index);
      const cacheData = dataMap[index];
      // 清空数据
      clearAll();
      return cacheData;
    }
    // 兜底重新发请求
    return fetch(params);
  };

  // 存数据
  const setData = async (params) => {
    const { index } = params;

    if (dataMap[index] || isLoading) return;
    isLoading = true;

    console.log('开始预请求数据', index);
    const promise = new Promise((resolve, reject) => {
      fetch(params)
        .then((res) => {
          console.log('预请求数据成功', index);
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        })
        .finally(() => {
          isLoading = false;
        });
    });
    dataMap[index] = promise;
  };

  return {
    getData,
    setData,
    clearAll,
    clearIndex,
  };
};

export default createPreFetch;
