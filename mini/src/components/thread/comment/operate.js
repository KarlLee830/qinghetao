import { updateComment, createPosts, updatePosts, reward, createReports, updateSingleReply } from '@server';
import xss from '@common/utils/xss';
import { plus } from '@common/utils/calculate';

class CommentAction {
  constructor(props) {
    this.list = props.list;
    this.threadData = props.threadData;
  }

  updateList(list) {
    this.list = list;
  }

  setCommentDetailField(key, data) {
    if (this.commentDetail && Reflect.has(this.commentDetail, key)) this.commentDetail[key] = data;
  }

  setReplyListDetailField(replyId, key, value) {
    if (this.commentDetail?.lastThreeComments?.length) {
      this.commentDetail.lastThreeComments.forEach((reply) => {
        if (reply.id === replyId) {
          reply[key] = value;
        }
      });
    }
  }

  addReplyToList(data) {
    (this.commentDetail?.commentPosts || []).push(data);
  }

  setThreadId(id) {
    this.threadId = id;
  }

  findOne(commentId, replyId) {
    let comment = this.list.find((item) => item.id === commentId);

    if (replyId && comment?.lastThreeComments?.length) {
      comment = comment.lastThreeComments.find((item) => item.id === replyId);
    }

    return comment;
  }

  async deleteOne(commentId, replyId) {
    const commentIndex = this.list.findIndex((item) => item.id === commentId);
    const comment = this.findOne(commentId);

    if (replyId) {
      if (comment.lastThreeComments) {
        const replyIndex = comment.lastThreeComments.findIndex((item) => item.id === replyId);
        const newestReply = await this.getCommentSingleRelpy(commentId);
        comment.lastThreeComments.splice(replyIndex, 1);
        comment.replyCount = comment.replyCount - 1;
        if (newestReply && newestReply.id) {
          comment.lastThreeComments.pop();
          comment.lastThreeComments.unshift(newestReply);
        }
      }
      return comment;
    }

    this.list.splice(commentIndex, 1);

    return comment;
  }

  /**
   * 获取评论的最新一条回复
   */
  async getCommentSingleRelpy(commentId) {
    const res = await updateSingleReply({ params: { postId: Number(commentId) } });
    if (res.code === 0) {
      return res.data;
    }
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
  async createComment(params) {
    const { id, content, attachments, postId, captchaTicket, captchaRandStr } = params;
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
      const newData = res.data;
      const isApproved = res.data.isApproved === 1;
      newData.lastThreeComments = [];

      if ((this.list || []).slice().filter(item => item.id === newData.id).length === 0) this.list.push(newData);

      return {
        redPacketAmount: res.data.redPacketAmount,
        isApproved: isApproved,
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
        isApproved: isApproved,
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
  async createReply(params) {
    const { id, commentId, replyId, commentPostId, content, isComment, attachments, captchaTicket, captchaRandStr } = params;
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

    if (res.code === 0 && res?.data?.id) {
      if (this.list?.length) {
        this.list.forEach((comment) => {
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
        isApproved: isApproved,
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
   * @param {number} parmas.commentId * 评论id
   * @param {number} parmas.replyId * 回复id
   * @param {boolean} params.isLiked 是否点赞
   * @returns {object} 处理结果
   */
  async updateLiked(params) {
    const { commentId, isLiked, replyId } = params;
    if (!commentId) {
      return {
        msg: '评论id不存在',
        success: false,
      };
    }

    const requestParams = {
      postId: replyId || commentId,
      data: {
        attributes: {
          isLiked,
        },
      },
    };
    const res = await updateComment({ data: requestParams });

    if (res?.data && res.code === 0) {
      const target = this.findOne(commentId, replyId);
      console.log(target);
      if (target) {
        target.likeCount = isLiked ? target.likeCount + 1 : target.likeCount - 1;
        target.isLiked = isLiked;
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
   * @param {number} replyId * 回复id
   * @returns {object} 处理结果
   */
  async delete({ commentId, replyId }) {
    if (!commentId) {
      return {
        success: false,
        msg: '评论id不存在',
      };
    }
    const requestParams = {
      postId: replyId || commentId,
      data: {
        attributes: {
          isDeleted: 1,
        },
      },
    };

    const res = await updateComment({ data: requestParams });
    if (res.code === 0) {
      this.deleteOne(commentId, replyId);

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
   * 采纳
   * @param {object} search * 搜索值
   * @returns {object} 处理结果
   */
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
      this.list.forEach((comment) => {
        if (comment.id === postId) {
          comment.rewards = plus(Number(comment.rewards), Number(rewards));
        }
      });

      if (this.threadData?.content?.indexes[107]?.body) {
        const remainMoney =  this.threadData.content.indexes[107].body.remainMoney ;
        this.threadData.content.indexes[107].body.remainMoney = Number(remainMoney - rewards).toFixed(2) ;
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
   * 举报
   * @param {object} search * 搜索值
   * @returns {object} 处理结果
   */
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
}

export default CommentAction;
