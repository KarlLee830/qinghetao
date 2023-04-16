import { action } from 'mobx';
import ThreadStore from './store';
import {
  updatePosts,
  operateThread,
  readCommentList,
  readThreadDetail,
  getRedPacketInfo,
  readThreadAttachmentUrl,
  shareThread,
  readUser,
  createReports,
  reward,
  deleteThread,
  createVote,
  readLikedUsers,
} from '@server';

import { plus } from '@common/utils/calculate';
import threadReducer from './reducer';
import rewardPay from '@common/pay-bussiness/reward-pay';
import createPreFetch from '@common/utils//pre-fetch';

class ThreadAction extends ThreadStore {
  constructor(props) {
    super(props);

    this.PreFetch = createPreFetch({
      fetch: this._preLoadCommentList.bind(this),
    });
  }

  @action
  setPageDataListType(data) {
    this.pageDataListType = data;
  }

  @action
  updateViewCount(viewCount) {
    this.threadData && (this.threadData.viewCount = viewCount);
  }

  @action
  setScrollDistance(scrollDistance) {
    this.scrollDistance = scrollDistance;
  }

  @action
  async fetchAuthorInfo(userId) {
    const userRes = await readUser({ params: { userId } });
    if (userRes.code === 0) {
      this.authorInfo = userRes.data;
      this.isAuthorInfoError = false;
    } else {
      this.isAuthorInfoError = true;
    }

    return userRes;
  }

  @action
  setAuthorInfo(userData) {
    this.authorInfo = userData;
  }


  @action
  setCommentListPage(page) {
    this.page = page;
  }

  /**
   * 更新列表页store
   */
  @action
  async updateListStore() {
    const id = this.threadData?.threadId;

    if (id) {
      this.threadList.updateAssignThreadInfoInLists({
        threadId: id,
        threadInfo: this.threadData,
      });
    }
  }

  /**
   * 更新评论数量
   * @param {number} count
   */
  @action
  updatePostCount(count = 0) {
    this.threadData?.likeReward && (this.threadData.likeReward.postCount = count);

    this.updateListStore();
  }

  /**
   * 获取帖子详细信息
   * @param {number} id 帖子id
   * @returns 帖子详细信息
   */
  @action
  async fetchThreadDetail(id) {
    const params = { threadId: id };
    const ret = await readThreadDetail({ params });
    const { code, data } = ret;
    if (code === 0) this.setThreadData(data);
    return ret;
  }

  /**
 * 获取帖子红包信息
 * @param {number} id 帖子id
 * @returns 帖子详细信息
 */
  @action
  async getRedPacketInfo(id) {
    const params = { threadId: id };
    const ret = await getRedPacketInfo(params);
    const { code, data } = ret;
    if (code === 0) {
      if (data?.status && data?.afterGetRedPacketFirstEnter) {
        this.setRedPacket(data.amount);
      }
    };
    return ret;
  }

  //设置当前可领取的红包状态
  @action
  setRedPacket(num) {
    this.hasRedPacket = num;
  }

  /**
   * 图片加载完成后数量加一
   */
  @action
  setContentImgLength() {
    this.contentImgLength += 1;
  }
  @action
  clearContentImgState() {
    this.contentImgLength = 0;
  }
  /**
   * 获取帖子内的附件url
   * @param {number} id 帖子id
   * @param {number} 帖子中的附件id
   * @returns 附件url
   */
  @action
  async fetchThreadAttachmentUrl(threadId, attachmentsId) {
    const params = { threadId, attachmentsId };
    return await readThreadAttachmentUrl({ params });
  }

  @action
  reset(params) {
    const { isPositionToComment = false } = params || {};
    this.threadData = null; // 帖子信息
    this.commentList = null; // 评论列表数据
    this.totalCount = 0; // 评论列表总条数
    this.authorInfo = null; // 作者信息
    this.isPositionToComment = isPositionToComment; // 是否定位到评论位置
    this.isCommentListError = false;
    this.isAuthorInfoError = false;
    this.scrollDistance = 0;
    // this.PreFetch = null; // 预加载相关
    this.pageDataListType = null; // 是否使用了列表缓存数据
  }

  // 定位到评论位置
  @action
  positionToComment() {
    this.isPositionToComment = true;
  }

  @action
  setThreadData(data) {
    // this.threadData = data;
    this.threadData = { ...this.threadData, ...data };
    this.threadData.id = data.threadId;
  }

  @action
  setThreadDetailLikePayCount(data) {
    this.threadData.likeReward.likePayCount = data;
  }

  @action
  setCheckUser = (data) => {
    this.checkUser = data;
  };

  /**
   * 更新帖子详情的点赞数据
   * @param {array} data
   */
  @action
  updateLikeReward(data) {
    this.threadData.likeReward.users = data;
  }

  @action
  setThreadDetailEssence(data) {
    this.threadData.displayTag.isEssence = data;
  }
  
  @action
  setThreadDetailPoster(data) {
    this.threadData.displayTag.isPoster = data;
  }

  @action
  setThreadDetailField(key, data) {
    if (this.threadData && Reflect.has(this.threadData, key)) this.threadData[key] = data;
  }

  @action
  setCommentList(list) {
    this.commentList = list;
  }

  @action
  setCommentListDetailField(commentId, key, value) {
    if (this.commentList?.length) {
      this.commentList.forEach((comment) => {
        if (comment.id === commentId) {
          comment[key] = value;
        }
      });
    }
  }

  @action
  setReplyListDetailField(commentId, replyId, key, value) {
    if (this.commentList?.length) {
      // 查找评论
      this.commentList.forEach((comment) => {
        if (comment.id === commentId) {
          if (comment?.lastThreeComments?.length) {
            // 查找回复
            comment?.lastThreeComments.forEach((reply) => {
              if (reply.id === replyId) {
                reply[key] = value;
              }
            });
          }
        }
      });
    }
  }

  @action
  setTotalCount(data) {
    this.totalCount = data;

    this.updatePostCount(data);
  }

  /**
   * 帖子收藏
   * @param { number} params.id 帖子id
   * @param { boolean} params.isFavorite 是否收藏
   * @returns {object} 处理结果
   */
  async updateFavorite(params) {
    const { id, isFavorite } = params;
    if (!id) {
      return {
        msg: '参数不完整',
        success: false,
      };
    }

    const requestParams = {
      id,
      isFavorite: !!isFavorite,
    };

    const res = await operateThread({ data: requestParams });

    if (res.code === 0) {
      // 3. 更新store
      this.setThreadDetailField('isFavorite', !!isFavorite);

      // 4. 返回成功
      return {
        msg: '操作成功',
        success: true,
      };
    }

    return {
      msg: res.msg,
      success: false,
    };
  }

  /**
   * 打赏帖子
   */
  @action
  async rewardPay(params, UserStore) {
    const { success, msg } = await rewardPay(params);

    // 支付成功重新请求帖子数据
    if (success) {
      this.setThreadDetailField('isReward', true);
      this.threadData.likeReward.likePayCount = (this.threadData.likeReward.likePayCount || 0) + 1;
      this.setThreadDetailLikePayCount(this.threadData.likeReward.likePayCount);

      // 更新打赏的用户
      const currentUser = UserStore?.userInfo;

      if (currentUser) {
        const userData = threadReducer.createUpdateLikeUsersData(currentUser, 2);
        const newLikeUsers = threadReducer.setThreadDetailLikedUsers(this.threadData?.likeReward, true, userData);
        this.updateLikeReward(newLikeUsers);
      }
      // 全量查询打赏人员列表
      this.queryTipList({ threadId: params.threadId, type: 2, page: 1 });

      // 更新列表store
      this.updateListStore();

      return {
        success: true,
        msg: '打赏成功',
      };
    }

    return {
      success: false,
      msg: msg || '打赏失败',
    };
  }

  /**
   * 帖子置顶
   * @param {object} parmas * 参数
   * @param {number} parmas.id * 帖子id
   * @param {boolean} params.isStick 是否置顶
   * @returns {object} 处理结果
   */
  @action
  async updateStick(params) {
    const { id, isStick } = params;
    if (!id) {
      return {
        msg: '参数不完整',
        success: false,
      };
    }

    const requestParams = {
      id,
      isSticky: !!isStick,
    };
    const res = await operateThread({ data: requestParams });

    if (res?.data && res.code === 0) {
      this.setThreadDetailField('isStick', !!isStick);

      return {
        msg: '操作成功',
        success: true,
      };
    }

    return {
      msg: res.msg,
      success: false,
    };
  }

  /**
   * 帖子加精
   * @param {object} parmas * 参数
   * @param {number} parmas.id * 帖子id
   * @param {boolean} params.isEssence 是否加精
   * @returns {object} 处理结果
   */
  @action
  async updateEssence(params) {
    const { id, isEssence } = params;
    if (!id) {
      return {
        msg: '参数不完整',
        success: false,
      };
    }

    const requestParams = {
      id,
      isEssence: !!isEssence,
    };

    const res = await operateThread({ data: requestParams });

    if (res?.data && res.code === 0) {
      this.setThreadDetailEssence(!!isEssence);

      return {
        msg: '操作成功',
        success: true,
      };
    }

    return {
      msg: res.msg,
      success: false,
    };
  }
  
  /**
   * 帖子海报
   * @param {object} parmas * 参数
   * @param {number} parmas.id * 帖子id
   * @param {boolean} params.isPoster 是否海报
   * @returns {object} 处理结果
   */
  @action
  async updatePoster(params) {
    const { id, isPoster } = params;
    if (!id) {
      return {
        msg: '参数不完整',
        success: false,
      };
    }
  
    const requestParams = {
      id,
      isPoster: !!isPoster,
    };
  
    const res = await operateThread({ data: requestParams });
  
    if (res?.data && res.code === 0) {
      this.setThreadDetailPoster(!!isPoster);
  
      return {
        msg: '操作成功',
        success: true,
      };
    }
  
    return {
      msg: res.msg,
      success: false,
    };
  }

  // TODO:帖子支付
  async pay() { }

  /**
   * 帖子删除
   * @param { number } * id 帖子id
   * @returns {object} 处理结果
   */
  @action
  async delete(id) {
    if (!id) {
      return {
        msg: '参数不完整',
        success: false,
      };
    }

    const requestParams = {
      threadId: id,
      // isDeleted: 1,
    };
    const res = await deleteThread({ data: requestParams });

    if (res.code === 0) {
      this.setThreadDetailField('isDelete', 1);

      // 删除帖子列表中的数据
      this.threadList.deleteAssignThreadInLists({ threadId: id });

      return {
        code: res.code,
        msg: '操作成功',
        success: true,
      };
    }

    return {
      code: res.code,
      msg: res.msg,
      success: false,
    };
  }

  /**
   * 分享
   * @param {number} threadId 帖子id
   */
  @action
  async shareThread(threadId) {
    if (!threadId) {
      return {
        msg: '参数不完整',
        success: false,
      };
    }

    const requestParams = {
      threadId,
    };
    const res = await shareThread({ data: requestParams });

    if (res.code === 0) {
      this.threadData.likeReward.shareCount = this.threadData?.likeReward?.shareCount - 0 + 1;

      this.updateListStore();

      return {
        msg: '操作成功',
        success: true,
      };
    }

    return {
      msg: res.msg,
      success: false,
    };
  }

  /**
   * 加载评论列表
   * @param {object} parmas * 参数
   * @param {number} parmas.id * 帖子id
   * @param {number} parmas.page 页数
   * @param {number} parmas.perPage 页码
   * @param {string} params.sort 'createdAt' | '-createdAt' 排序条件
   * @returns {object} 处理结果
   */
  async _preLoadCommentList(params) {
    const res = await readCommentList({ params });

    return res;
  }

  @action
  async preFetch(params) {
    const { id, page = 1, perPage = 20, sort = 'createdAt' } = params;
    if (!id) {
      return {
        msg: '帖子id不存在',
        success: false,
      };
    }

    const requestParams = {
      filter: {
        thread: Number(id),
      },
      sort,
      page,
      perPage,
      index: page,
    };

    this.PreFetch.setData(requestParams);
  }

  /**
   * 加载评论列表
   * @param {object} parmas * 参数
   * @param {number} parmas.id * 帖子id
   * @param {number} parmas.page 页数
   * @param {number} parmas.perPage 页码
   * @param {string} params.sort 'createdAt' | '-createdAt' 排序条件
   * @returns {object} 处理结果
   */
  @action
  async loadCommentList(params) {
    const { id, page = 1, perPage = 20, sort = 'createdAt' } = params;
    if (!id) {
      return {
        msg: '帖子id不存在',
        success: false,
      };
    }

    // 清空预加载缓存
    if (page === 1) {
      console.log('清空预加载缓存');
      this.PreFetch.clearAll();
    }

    const requestParams = {
      filter: {
        thread: Number(id),
      },
      sort,
      page,
      perPage,
      index: page,
    };

    const res = await this.PreFetch.getData(requestParams);

    if (res.code === 0 && res?.data?.pageData) {
      let { commentList } = this;
      if (!commentList) {
        commentList = [];
      }

      page === 1 ? (commentList = res?.data?.pageData || []) : commentList.push(...(res?.data?.pageData || []));

      this.setCommentList(this.commentListAdapter(commentList));
      this.setTotalCount(res?.data?.totalCount || 0);
      this.totalPage = res?.data.totalPage;

      return {
        msg: '操作成功',
        success: true,
      };
    }

    this.isCommentListError = true;

    return {
      msg: res.msg,
      success: false,
    };
  }

  /**
   * 关注
   * @param {object} userId * 被关注人id
   * @param {object} UserStore * userstore
   * @returns {object} 处理结果
   */
  @action
  async postFollow(userId, UserStore) {
    const res = await UserStore.postFollow(userId);

    if (res.success && res.data) {
      this.authorInfo.follow = res.data.isMutual ? 2 : 1;
      this.authorInfo.fansCount = this.authorInfo.fansCount + 1;

      return {
        msg: '操作成功',
        success: true,
      };
    }
    return {
      msg: res.msg,
      success: false,
    };
  }

  /**
   * 取消关注
   * @param {object} userId * 被关注人id
   * @param {object} type * 关注类型
   * @param {object} UserStore * userstore
   * @returns {object} 处理结果
   */
  @action
  async cancelFollow({ id, type }, UserStore) {
    const res = await UserStore.cancelFollow({ id, type });

    if (res.success && res.data) {
      this.authorInfo.follow = 0;
      this.authorInfo.fansCount = this.authorInfo.fansCount - 1;

      return {
        msg: '操作成功',
        success: true,
      };
    }
    return {
      msg: res.msg,
      success: false,
    };
  }

  /**
   * 举报
   * @param {object} search * 搜索值
   * @returns {object} 处理结果
   */
  @action
  async createReports(params) {
    const { threadId, type, reason, postId, userId } = params;

    const requestParams = {
      threadId,
      type,
      reason,
      postId,
      userId,
    };

    const res = await createReports({ data: requestParams });

    if (res.code === 0 && res.data) {
      return {
        msg: '操作成功',
        success: true,
      };
    }
    return {
      msg: res.msg,
      success: false,
    };
  }

  /**
   * 采纳
   * @param {object} search * 搜索值
   * @returns {object} 处理结果
   */
  @action
  async reward(params) {
    const { threadId, postId, rewards } = params;

    const requestParams = {
      threadId,
      postId,
      rewards,
    };

    const res = await reward({ data: requestParams });

    if (res.code === 0) {
      // 更新store
      this.commentList.forEach((comment) => {
        if (comment.id === postId) {
          comment.rewards = plus(Number(comment.rewards), Number(rewards));
        }
      });

      return {
        msg: '操作成功',
        success: true,
      };
    }
    return {
      msg: res.msg,
      success: false,
    };
  }

  // 适配器
  commentListAdapter(list = []) {
    list.forEach((item) => {
      const { lastThreeComments } = item;
      if (lastThreeComments?.length > 1) {
        item.lastThreeComments = [lastThreeComments[0]];
      }
    });
    return list;
  }

  /**
   * 帖子点赞
   * @param {object} parmas * 参数
   * @param {number} parmas.id * 帖子id
   * @param {number} parmas.pid * 帖子评论od
   * @param {boolean} params.isLiked 是否点赞
   * @returns {object} 处理结果
   */
  @action
  async updateLiked(params, IndexStore, UserStore) {
    const { id, pid, isLiked } = params;
    if (!id || !pid) {
      return {
        msg: '参数不完整',
        success: false,
      };
    }

    const requestParams = {
      id,
      postId: pid,
      data: {
        attributes: {
          isLiked: !!isLiked,
        },
      },
    };
    const res = await updatePosts({ data: requestParams });

    if (res?.data && res.code === 0) {
      this.setThreadDetailField('isLike', !!isLiked);
      this.setThreadDetailLikePayCount(res.data.likePayCount);

      // 更新点赞的用户
      const currentUser = UserStore?.userInfo;
      if (currentUser) {
        const userData = threadReducer.createUpdateLikeUsersData(currentUser, 1);
        const newLikeUsers = threadReducer.setThreadDetailLikedUsers(this.threadData?.likeReward, !!isLiked, userData);
        this.updateLikeReward(newLikeUsers);
      }

      // 更新列表store
      this.updateListStore();

      return {
        msg: '操作成功',
        success: true,
      };
    }

    return {
      msg: res.msg,
      success: false,
    };
  }

  // 参与投票（属于帖子的操作，所以放到帖子里的）
  @action
  async createVote(params) {
    const { threadId } = params;
    if (!threadId) {
      return {
        msg: '参数不完整',
        success: false,
      };
    }
    const { data, code, msg } = await createVote({ data: params });
    return { data, success: code === 0, threadId, msg };
  }

  // 更新帖子
  @action
  updateThread(tomId, tomValue) {
    const { content = {} } = this.threadData || {};
    const { indexes = {} } = content || {};
    const newIndexes = { ...indexes };
    newIndexes[tomId] = tomValue;
    this.threadData = { ...this.threadData, content: { ...content, indexes: newIndexes } };
  }

  // 查询打赏列表
  @action
  async queryTipList(params) {
    const res = await readLikedUsers({ params: { ...params, perPage: 300 } });
    let resList = res.data?.pageData?.list;

    if (resList){
      resList = resList.filter(i => i.type === 3);

      const filterObj = {};
      resList = resList.reduce((cur, next) => {
        console.log(next);
        filterObj[next.userId] ? "" : filterObj[next.userId] = true && cur.push(next);
        return cur;
      }, [])


      this.threadData = { ...this.threadData, tipList: resList.slice(0, 32) || [] }
    }
  }

}

export default ThreadAction;
