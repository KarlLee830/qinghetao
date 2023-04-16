import { action } from 'mobx';
import CommentListStore from './store';
import { readCommentList, positionPosts } from '@server';

/**
 * 定位到指定评论位置相关数据
 */
class PositionCommentAction extends CommentListStore {
  /**
   * 获取评论所在的列表位置
   * @param {*} params
   * @returns {object}
   */
  @action
  async fetchPositionPosts(params) {
    const res = await positionPosts({
      params: {
        filter: params,
      },
    });

    if (res.code === 0) {
      this.postsPositionPage = res.data.page;
    }

    return res;
  }

  @action
  reset(params) {
    this.commentList = null; // 评论列表数据
    this.isCommentListError = false;
    this.postsPositionPage = null;
    this.postId = null;
  }

  @action
  setCommentList(list) {
    this.commentList = list;
  }

  @action
  setPostId(id) {
    this.postId = id;
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

    const requestParams = {
      filter: {
        thread: Number(id),
      },
      sort,
      page,
      perPage,
      index: page,
    };

    const res = await readCommentList({ params: requestParams });

    if (res.code === 0 && res?.data?.pageData) {
      let { commentList } = this;

      page === 1 ? (commentList = res?.data?.pageData || []) : commentList.push(...(res?.data?.pageData || []));

      this.setCommentList(this.commentListAdapter(commentList));

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
}

export default PositionCommentAction;
