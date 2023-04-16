import threadListStore from './list';
import threadReducer from '../thread/reducer';
import typeofFn from '@common/utils/typeof';
import { readCommentList } from '@server';
import { extendObservable } from 'mobx';

export const updateMyThreadAvatar = ({ avatarUrl, threadList }) => {
  threadList.registerList({ namespace: 'my' });

  const { my } = threadList.lists;

  Object.values(my.data).forEach((pageData) => {
    pageData.forEach((threadItem) => {
      if (!threadItem.user) {
        threadItem.user = {};
      }
      threadItem.user.avatar = avatarUrl;
    });
  });

  threadList.forceUpdateList();
};

/**
 * 更新所有列表指定帖子状态
 * @param {number} threadId 帖子id
 * @param {object}  obj 更新数据
 * @returns
 */
export const updateThreadAssignInfoInLists = (threadId, obj = {}) => {
  const targetThreadList = threadListStore.getInstance().findAssignThreadInLists({ threadId });

  const { updateType, updatedInfo, user, openedMore, recomputeRowHeights } = obj;

  const threadUpdater = ({ data, callback = () => {} }) => {
    if (!data && !data?.likeReward && !data?.likeReward?.users) return;

    // 更新整个帖子内容
    if (data && updateType === 'content') {
      callback(data);
    }

    // 更新点赞
    if (
      updateType === 'like' &&
      !typeofFn.isUndefined(updatedInfo.isLiked) &&
      !typeofFn.isNull(updatedInfo.isLiked) &&
      user
    ) {
      const { isLiked, likePayCount = 0 } = updatedInfo;
      const theUserId = user.userId || user.id;
      data.isLike = isLiked;

      const userData = threadReducer.createUpdateLikeUsersData(user, 1);
      // 添加当前用户到按过赞的用户列表
      const newLikeUsers = threadReducer.setThreadDetailLikedUsers(data.likeReward, !!isLiked, userData);

      data.likeReward.users = newLikeUsers;
      data.likeReward.likePayCount = likePayCount;
    }

    // 更新评论：新增
    if (updateType === 'comment' && data?.likeReward) {
      data.likeReward.postCount = data.commentList.length;
    }

    // 更新评论：减少
    if (updateType === 'decrement-comment' && data?.likeReward && data.likeReward.postCount > 0) {
      data.likeReward.postCount = data.commentList.length;;
    }

    // 更新分享
    if (updateType === 'share') {
      data.likeReward.shareCount = data.likeReward.shareCount + 1;
    }

    // 更新帖子浏览量
    if (updateType === 'viewCount') {
      data.viewCount = updatedInfo.viewCount;
    }

    if (updateType === 'openedMore') {
      data.openedMore = openedMore;
    }

    if (typeofFn.isFunction(recomputeRowHeights)) recomputeRowHeights(data);
    callback(data);
  };

  if (targetThreadList?.length) {
    targetThreadList.forEach((targetThread) => {
      const { index, data, listName, page } = targetThread;

      threadUpdater({
        data,
        callback: (updatedInfo) => {
          threadListStore.getInstance().lists[listName].data[page][index] = updatedInfo;
        },
      });
    });
  }
};

/**
 * 支付成功后，更新帖子列表指定帖子状态
 * @param {number} threadId 帖子id
 * @param {object}  obj 更新数据
 * @returns
 */
export const updatePayThreadInfo = (threadId, obj) => {
  threadListStore.getInstance().updateAssignThreadInfoInLists({
    threadId,
    threadInfo: obj,
  });
};

/**
 * 获取指定帖子下的评论列表
 * @param {*} threadId 帖子id
 */
export const getThreadCommentList = async (threadId, recomputeRowHeights) => {
  const targetThreadList = threadListStore.getInstance().findAssignThreadInLists({ threadId });

  let res;

  if (targetThreadList?.length) {
    targetThreadList.forEach(async (targetThread) => {
      if (targetThread && targetThread.data) {
        if (!Reflect.has(targetThread.data, 'commentList')) {
          _observerCommentList(targetThread.data);
        }

        targetThread.data.isLoading = true;
        if (!res) {
          res = await readCommentList({
            params: {
              filter: {
                thread: Number(threadId),
              },
              page: 1,
              perPage: 10,
              index: 1,
            },
          });
        }

        if (res.code === 0) {
          targetThread.data.commentList = res?.data?.pageData || [];
          targetThread.data.requestError = {
            isError: false,
            errorText: '加载失败',
          };
        } else {
          targetThread.data.requestError = {
            isError: true,
            errorText: res.msg || '加载失败',
          };
        }

        targetThread.data.isLoading = false;
        if (typeof recomputeRowHeights === 'function') recomputeRowHeights(targetThread.data);
      }
    });
  }
};

const _observerCommentList = (thread) => {
  extendObservable(thread, {
    commentList: [],
    requestError: {
      isError: false,
      errorText: '加载失败',
    },
    isLoading: false,
  });
};
