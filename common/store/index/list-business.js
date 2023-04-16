import { updateThreadStick } from '@server/index';

/**
 * 更新所有 我的 帖子的头像，用于头像更新时使用
 * @param avatarUrl
 * @param indexStore
 */
export const updateMyThreadAvatar = ({ avatarUrl, indexStore }) => {
  indexStore.registerList({ namespace: 'my' });

  const { my } = indexStore.lists;

  Object.values(my.data).forEach((pageData) => {
    pageData.forEach((threadItem) => {
      if (!threadItem.user) {
        threadItem.user = {};
      }
      threadItem.user.avatar = avatarUrl;
    });
  });

  indexStore.forceUpdateList();
};

/**
 * 找到当前的置顶帖
 * @param indexStore
 * @returns {null|*}
 */
export const findCurrentStickedThread = ({ indexStore }) => {
  const myList = indexStore.getList({ namespace: 'my' });

  if (myList[0] && myList[0].userStickStatus === 1) {
    return myList[0];
  }

  return null;
};

/**
 * 设置帖子被置顶
 * @param thread
 * @param indexStore
 */
export const setThreadBeSticked = async ({ thread, indexStore }) => {
  const { threadId } = thread;
  const opts = {
    data: {
      threadId,
      status: 1,
    },
  };

  const ret = await updateThreadStick(opts);

  if (ret.code !== 0) {
    return {
      success: false,
      msg: ret.msg,
    };
  }

  indexStore.clearList({ namespace: 'my' });

  const fetchListRet = await indexStore.fetchList({
    namespace: 'my',
    filter: {
      toUserId: 0,
      complex: 5,
    },
  });

  indexStore.setList({ namespace: 'my', data: fetchListRet });

  return { success: true };
};

/**
 * 设置帖子取消置顶
 * @param thread
 * @param indexStore
 */
export const setThreadBeUnSticked = async ({ thread, indexStore }) => {
  const { threadId } = thread;
  const opts = {
    data: {
      threadId,
      status: 0,
    },
  };

  const ret = await updateThreadStick(opts);

  if (ret.code !== 0) {
    return {
      success: false,
      msg: ret.msg,
    };
  }

  indexStore.clearList({ namespace: 'my' });

  const fetchListRet = await indexStore.fetchList({
    namespace: 'my',
    filter: {
      toUserId: 0,
      complex: 5,
    },
  });

  indexStore.setList({ namespace: 'my', data: fetchListRet });

  return { success: true };
};
