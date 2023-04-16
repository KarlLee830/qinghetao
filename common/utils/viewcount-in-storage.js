import Storage from '@common/utils/session-storage';
import { getViewCount } from '@server';

/**
 * sessionStorage中存储页面帖子被观看过的信息，用于记录分析浏览量等信息
 *
 * @param  {number}    threadId: 帖子的ID
 *
 */

const STORAGE_KEY = "__dzq_thread_viewed";
const STORAGE_TYPE = "session";
const storage = new Storage({ storageType: STORAGE_TYPE });

const getViewedPos = (threadId = null) => {
  if(!threadId || !storage) return -1;
  threadId += ''; // 统一为字符串

  const value = storage.get(STORAGE_KEY) || `{}`
  let viewedObj = JSON.parse(value);
  if(!viewedObj || !Object.keys(viewedObj).length) {
    viewedObj = { threads: [] };
    storage.set(STORAGE_KEY, JSON.stringify(viewedObj));
    return -1;
  }

  const viewedThreads = viewedObj.threads;
  for(let i = viewedThreads.length - 1; viewedThreads && i >= 0; i--) {
    const thread = viewedThreads[i];
    if(`${thread.id}` === `${threadId}`) {
      return i;
    }
  }
  return -1;
}

/**
 *
 * 看过的帖子，帖子信息会被增加到队列尾部，尾部的帖子总是最近浏览过的
 *
 * @param  {number}    threadId: 帖子的ID
 *
 * viewed在storage中结构
 * {
 *    viewed: {
 *      threads: [
 *        {
 *          id: threadId,
 *          viewedAt: new Date().getTime(); // time in millisecond
 *        }
 *      ];
 *    }
 * }
 */
const addViewedThread = (threadId = null, threadIndex) => {
  if(!threadId || !storage) return ;
  threadId += ''; // 统一为字符串

  const value = storage.get(STORAGE_KEY) || `{}`
  const viewedObj = JSON.parse(value);
  const { threads } = viewedObj;

  if(!threads) return;

  if(threadIndex >= 0) { // 删掉已看过的帖子
    threads.splice(threadIndex, 1);
  }
  threads.push({ // 看过的帖子信息放在队列尾部
    id: threadId,
    viewedAt: new Date().getTime(),
  });
  viewedObj.threads = [...threads];
  storage.set(STORAGE_KEY, JSON.stringify(viewedObj));
}


const updateViewCountInStorage = async (threadId = null, shouldStore = true) => {
  if(!threadId) return ;
  threadId += ''; // 统一为字符串
  try {
    const viewedThreadPos = getViewedPos(threadId);
    if(viewedThreadPos === -1) { // storage中没找到帖子
      // 更新后台数据
      const res = await getViewCount({ params: { threadId } });
      if(res.code === 0) {
        // 更新storage中浏览数据
        if(shouldStore) addViewedThread(threadId, viewedThreadPos);
        return res.data.viewCount;
      } else {
        console.error(res?.msg);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}


export { updateViewCountInStorage, STORAGE_KEY, STORAGE_TYPE };
