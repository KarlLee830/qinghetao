import { action } from 'mobx';
import CommentStore from './store';
import {
  readCommentDetail,
  updateComment,
  createPosts,
  updatePosts,
  readUser,
  deleteFollow,
  updateSingleReply,
} from '@server';
import xss from '@common/utils/xss';

class CommentAction extends CommentStore {
  constructor(props) {
    super(props);
  }

  /**
   * 获取评论详情
   * @param {number} id 评论id
   * @returns 详细信息
   */
  @action
  async fetchCommentDetail(id) {
    const res = await readCommentDetail({ params: { postId: Number(id) } });
    if (res?.code === 0) {
      this.setCommentDetail(res.data);
    } else {
      this.reset();
      this.isServerError = true;
    }
    this.isLoading = false;

    return res;
  }

  @action
  async fetchAuthorInfo(userId) {
    const userRes = await readUser({ params: { userId } });
    if (userRes.code === 0) {
      this.authorInfo = userRes.data;
    } else {
      this.isAuthorInfoError = true;
    }

    return userRes;
  }

  @action
  async setPostId(postId) {
    this.postId = postId;
  }

  @action
  reset() {
    this.commentDetail = null;
    this.threadId = null;
    this.authorInfo = null;
  }

  @action.bound
  setPostContent({value = '', imageList = []}) {
    this.postValue = value;
    this.postImageList = imageList;
  }

  @action.bound
  clearPostContent() {
    this.postValue = '';
    this.postImageList = [];
  }

  
  @action.bound
  setCaptchaMark(id) {
    this.captchaMark = id;
  }

  @action
  setCommentDetail(data) {
    this.commentDetail = data;
    if (this.commentDetail) {
      this.commentDetail.commentPosts = this?.commentDetail?.commentPosts || [];
      this.commentDetail.lastThreeComments = this.commentDetail.commentPosts;
    }
  }

  @action
  setCommentDetailField(key, data) {
    if (this.commentDetail && Reflect.has(this.commentDetail, key)) this.commentDetail[key] = data;
  }

  @action
  setReplyListDetailField(replyId, key, value) {
    if (this.commentDetail?.lastThreeComments?.length) {
      this.commentDetail.lastThreeComments.forEach((reply) => {
        if (reply.id === replyId) {
          reply[key] = value;
        }
      });
    }
  }

  @action
  addReplyToList(data) {
    (this.commentDetail?.commentPosts || []).push(data);
  }

  @action
  setThreadId(id) {
    this.threadId = id;
  }

  @action
  deleteReplyToList(replyId) {
    this.commentDetail?.commentPosts.map((reply, index) => {
      if (reply.id === replyId) {
        this.commentDetail.commentPosts?.splice(index, 1);
      }
    });
  }
  /**
   * 创建评论
   * @param {object} params * 参数
   * @param {number} params.id * 帖子id
   * @param {string} params.content * 评论内容
   * @param {array} params.attachments 附件内容
   * @param {boolen} params.sort 当前排序  ture 评论从旧到新 false 评论从新到旧
   * @param {boolen} params.isNoMore 是否没有更多
   * @returns {object} 处理结果
   */
  @action
  async createComment(params, ThreadStore) {
    const { id, content, attachments, postId, sort, isNoMore, captchaTicket, captchaRandStr } = params;
    if (!id || (!content && attachments.length === 0)) {
      return {
        msg: '参数不完整',
        success: false,
      };
    }

    const requestParams = {
      id,
      content: xss(content),
      replyId: postId,
      attachments,
    };

    if (captchaTicket && captchaRandStr) {
      requestParams.captchaTicket = captchaTicket;
      requestParams.captchaRandStr = captchaRandStr;
    }

    const res = await createPosts({ data: requestParams });

    if (res.code === 0 && res?.data?.id) {
      const { commentList, totalCount } = ThreadStore;

      const newTotalCount = totalCount + 1;
      ThreadStore && ThreadStore.setTotalCount(newTotalCount);
      const newData = res.data;
      const isApproved = res.data.isApproved === 1;
      newData.lastThreeComments = [];

      // 头部添加评论
      if (sort === false) {
        commentList.unshift(newData);
        ThreadStore && ThreadStore.setCommentList(commentList);
      }

      // 尾部添加评论
      if (sort === true && isNoMore === true) {
        commentList.push(newData);
        ThreadStore && ThreadStore.setCommentList(commentList);
      }

      return {
        redPacketAmount: res.data.redPacketAmount,
        isApproved,
        msg: isApproved ? '评论成功' : '您发布的内容正在审核中',
        success: true,
      };
    }

    return {
      msg: res.msg,
      success: false,
    };
  }

  /**
   * 修改评论
   * @param {object} params * 参数
   * @param {number} params.id * 帖子id
   * @param {number} params.postId * 评论id
   * @param {string} params.content * 评论内容
   * @param {array} params.attachments 附件内容
   * @returns {object} 处理结果
   */
  @action
  async updateComment(params, ThreadStore) {
    const { id, postId, content, attachments, captchaTicket, captchaRandStr } = params;
    if (!id || !content || !postId) {
      return {
        msg: '参数不完整',
        success: false,
      };
    }

    const requestParams = {
      id,
      postId,
      data: {
        attributes: {
          content: xss(content),
          attachments,
        },
      },
    };

    if (captchaTicket && captchaRandStr) {
      requestParams.captchaTicket = captchaTicket;
      requestParams.captchaRandStr = captchaRandStr;
    }

    const res = await updatePosts({ data: requestParams });

    if (res.code === 0 && res?.data?.content && ThreadStore) {
      const { commentList } = ThreadStore;

      // 更新列表中的评论
      (commentList || []).forEach((comment) => {
        if (comment.id === postId) {
          comment.content = res.data.content;
        }
      });

      const isApproved = res.data.isApproved === 1;

      return {
        isApproved,
        msg: isApproved ? '修改成功' : '您修改的内容正在审核中',
        success: true,
      };
    }

    return {
      msg: res.msg,
      success: false,
    };
  }

  /**
   * 创建回复：回复评论 + 回复回复
   * @param {object} params * 参数
   * @param {number} params.id * 帖子id
   * @param {number} params.commentId * 评论id
   * @param {number} params.replyId * 回复id
   * @param {boolean} params.isComment 是否楼中楼
   * @param {string} params.content * 评论内容
   * @param {array} params.attachments 附件内容
   * @param {array} params.commentPostId 评论回复ID
   * @param {array} params.commentUserId 评论回复用户id
   * @returns {object} 处理结果
   */
  @action
  async createReply(params, ThreadStore) {
    const { id, commentId, replyId, commentPostId, content, isComment, attachments, captchaRandStr, captchaTicket } = params;
    if (!id || (!content && attachments.length === 0) || !replyId || !commentId) {
      return {
        msg: '参数不完整',
        success: false,
      };
    }
    const requestParams = {
      id,
      replyId,
      content: xss(content),
      isComment,
      attachments,
      commentPostId,
    };

    if (captchaTicket && captchaRandStr) {
      requestParams.captchaTicket = captchaTicket;
      requestParams.captchaRandStr = captchaRandStr;
    }

    const res = await createPosts({ data: requestParams });

    if (res.code === 0 && res?.data?.id && ThreadStore) {
      const { commentList } = ThreadStore;
      if (commentList?.length) {
        commentList.forEach((comment) => {
          if (commentId === comment.id) {
            comment.replyCount = comment.replyCount + 1;
            comment.lastThreeComments.splice(0, 1, res.data);
          }
        });
      }

      // 更新回复列表
      this.addReplyToList(res.data);
      const isApproved = res.data.isApproved === 1;

      return {
        isApproved,
        msg: isApproved ? '回复成功' : '您回复的内容正在审核中',
        success: true,
      };
    }

    return {
      msg: res.msg,
      success: false,
    };
  }

  /**
   * 点赞: 评论点赞 + 回复点赞
   * @param {object} parmas * 参数
   * @param {number} parmas.id * 评论id
   * @param {boolean} params.isLiked 是否点赞
   * @returns {object} 处理结果
   */
  @action
  async updateLiked(params, ThreadStore, IndexStore, SearchStore, TopicStore) {
    const { id, isLiked } = params;
    if (!id) {
      return {
        msg: '评论id不存在',
        success: false,
      };
    }

    const requestParams = {
      postId: id,
      data: {
        attributes: {
          isLiked,
        },
      },
    };
    const res = await updateComment({ data: requestParams });

    if (res?.data && res.code === 0) {
      if (Number(res.data.redPacketAmount) > 0) {
        const threadId = ThreadStore?.threadData?.id;
        ThreadStore.setCommentListDetailField(res.data.postId, 'redPacketAmount', res.data.redPacketAmount);
        await ThreadStore.fetchThreadDetail(threadId);
        ThreadStore.updateListStore();
      }

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
   * 删除评论
   * @param {number} commentId * 评论id
   * @returns {object} 处理结果
   */
  @action
  async delete(commentId, ThreadStore) {
    if (!commentId) {
      return {
        success: false,
        msg: '评论id不存在',
      };
    }
    const requestParams = {
      postId: commentId,
      data: {
        attributes: {
          isDeleted: 1,
        },
      },
    };
    const res = await updateComment({ data: requestParams });
    if (res.code === 0 && ThreadStore) {
      // 更新评论列表
      const { commentList, totalCount } = ThreadStore;
      if (commentList?.length) {
        const index = commentList.findIndex(comment => commentId === comment.id);
        commentList.splice(index, 1);
        const newTotalCount = totalCount - 1;
        ThreadStore.setTotalCount(newTotalCount);
      }

      return {
        success: true,
        msg: '删除成功',
      };
    }

    return {
      msg: res.msg,
      success: false,
    };
  }

  /**
   * 删除评论回复
   * @param {number} replyId * 评论回复id
   * @returns {object} 处理结果
   */
  @action
  async deleteReplyComment(params, ThreadStore) {
    const { id: replyId } = params.replyData;
    const { id: commentId } = params.commentData;
    if (!replyId) {
      return {
        success: false,
        msg: '回复评论id不存在',
      };
    }
    const requestParams = {
      postId: replyId,
      data: {
        attributes: {
          isDeleted: 1,
        },
      },
    };
    const res = await updateComment({ data: requestParams });
    if (res.code === 0 && ThreadStore) {
      const { commentList } = ThreadStore;
      // 在评论列表页
      if (commentList?.length) {
        commentList.map((comment) => {
          if (commentId === comment.id) {
            comment.replyCount = comment.replyCount - 1;
            comment.lastThreeComments?.splice(0, 1); // 把要删除的评论回复从全局状态里删除
          }
        });
        // 更新评论列表
        const res = await updateSingleReply({ params: { postId: Number(commentId) } });
        if (res.code === 0 && res.data) {
          commentList.map((comment) => {
            if (comment.id === commentId) {
              comment.lastThreeComments?.push(res.data);
            }
          });
        }
      }

      this.deleteReplyToList(replyId);
      return {
        msg: '操作成功',
        success: true,
      };
    }
  }

  /**
   * 获取回复详情
   * @param {object} parmas * 参数
   * @param {number} parmas.id * 评论id
   * @returns {object} 处理结果
   */
  @action
  async getCommentDetail(params) {
    const { id } = params;

    if (!id) {
      return {
        msg: '评论id不存在',
        success: false,
      };
    }

    const requestParams = {
      postId: id,
    };

    const res = await readCommentDetail({ params: requestParams });

    if (res.code === 0 && res?.data?.id) {
      this.setCommentDetail(res.data);

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
   * 关注
   * @param {object} userId * 被关注人id
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
   * @param {object} search * 搜索值
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
   * 采纳
   * @param {object} search * 搜索值
   * @returns {object} 处理结果
   */
  @action
  async reward({ id, type }) {
    const res = await deleteFollow({ data: { id, type } });
    if (res.code === 0 && res.data) {
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
}

export default CommentAction;
