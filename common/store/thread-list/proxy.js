
/**
 * 帖子列表代理
 * 在不改变原有的业务逻辑的基础上，统一帖子列表数据操作至threadList
 */
export default (data, params) => {
  const { listStore, namespace } = params;

  const updateAssignThreadInfoInLists = listStore.updateAssignThreadInfoInLists.bind(listStore); // 更新所有列表
  const deleteAssignThreadInLists = listStore.deleteAssignThreadInLists.bind(listStore); // 删除所有列表
  const addThreadInTargetList = listStore.addThreadInTargetList.bind(listStore); // 新增指定列表
  const setAttribute = listStore.setAttribute.bind(listStore); // 更新指定列表属性
  const setTargetListDataByList = listStore.setTargetListDataByList.bind(listStore); // 更新指定列表的数据

  if (data) {
    return new Proxy(data, {
      get(oTarget, sKey) {
        const res = Reflect.get(oTarget, sKey);
        // 代理pageData
        if (sKey === 'pageData' && Array.isArray(res)) {
          return new Proxy(res, {
            set: (oTarget, sKey, vValue) => {
              const cbType = oTarget[sKey] === undefined ? 'create' : 'modify';

              if (sKey === 'length') {
                Reflect.set(oTarget, sKey, vValue);
                return true;
              }
              // 新增 TODO: 新增这块还有问题，unshift不能正常监听获取value，push可以
              if (cbType === 'create') {
                addThreadInTargetList({
                  namespace,
                  threadInfo: vValue,
                });
              }
              // 修改
              if (cbType === 'modify') {
                // 更新帖子信息
                updateAssignThreadInfoInLists({
                  threadId: vValue.threadId,
                  threadInfo: vValue,
                });
              }
              return true;
            },
            // 删除
            deleteProperty(oTarget, sKey) {
              if (sKey in oTarget) {
                deleteAssignThreadInLists({
                  threadId: oTarget[sKey].threadId,
                });
                return true;
              }
            },
          });
        }
        return res;
      },
      set(oTarget, sKey, vValue) {
        if (sKey === 'pageData') {
          // 批量更新
          setTargetListDataByList({
            namespace,
            list: vValue,
          });
        } else {
          setAttribute({
            namespace,
            key: sKey,
            value: vValue,
          });
        }
        return true;
      },
    });
  }
};
