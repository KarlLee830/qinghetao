import React, { Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import CommentList from '../../components/comment-list/index';
import comment from './index.module.scss';
import { parseContentData } from '../../utils';
import DeletePopup from '../../components/delete-popup';
import goToLoginPage from '@common/utils/go-to-login-page';
import Router from '@discuzqsdk/sdk/dist/router';

/**
 * 详情页下方评论列表
 * 回复、采纳行为统一传递到详情根页面进行
 * */
@inject('index')
@inject('topic')
@inject('search')
@inject('thread')
@inject('commentPosition')
@inject('comment')
@inject('user')
@inject('site')
@observer
class RenderCommentList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commentSort: true, // ture 评论从旧到新 false 评论从新到旧
      showDeletePopup: false, // 是否弹出删除弹框
      showReplyDeletePopup: false, // 是否弹出回复删除弹框
      inputText: '请输入内容', // 默认回复框placeholder内容
    };

    this.commentData = null;
    this.replyData = null;

    this.recordCommentLike = {
      // 记录当前评论点赞状态
      id: null,
      status: null,
    };
    this.recordReplyLike = {
      // 记录当前评论点赞状态
      id: null,
      status: null,
    };
  }

  // 评论列表排序
  onSortClick = async () => {
    if (typeof this.props.sort === 'function') {
      try {
        const success = await this.props.sort(!this.state.commentSort);
        if (success) {
          this.setState({
            commentSort: !this.state.commentSort,
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  // 点击评论的赞
  async likeClick(data) {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/userPages/user/wx-auth/index' });
      return;
    }

    if (!data.id) return;

    if (this.recordCommentLike.id !== data.id) {
      this.recordCommentLike.status = null;
    }
    if (this.recordCommentLike.status !== data.isLiked) {
      this.recordCommentLike.status = data.isLiked;
      this.recordCommentLike.id = data.id;
    } else {
      return;
    }

    const params = {
      id: data.id,
      isLiked: !data.isLiked,
    };

    const threadStore = this.props.thread;
    const indexStore = this.props.index;
    const searchStore = this.props.search;
    const topicStore = this.props.topic;

    const { success, msg } = await this.props.comment.updateLiked(
      params,
      threadStore,
      indexStore,
      searchStore,
      topicStore,
    );

    if (this.props.isPositionComment) {
      this.props.commentPosition.setCommentListDetailField(data.id, 'isLiked', params.isLiked);
      const likeCount = params.isLiked ? data.likeCount + 1 : data.likeCount - 1;
      this.props.commentPosition.setCommentListDetailField(data.id, 'likeCount', likeCount);
    } else {
      this.props.thread.setCommentListDetailField(data.id, 'isLiked', params.isLiked);
      const likeCount = params.isLiked ? data.likeCount + 1 : data.likeCount - 1;
      this.props.thread.setCommentListDetailField(data.id, 'likeCount', likeCount);
    }

    if (!success) {
      Toast.error({
        content: msg,
      });
    }
  }

  // 点击回复的赞
  async replyLikeClick(reply, comment) {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/userPages/user/wx-auth/index' });
      return;
    }

    if (!reply.id) return;

    if (this.recordReplyLike.id !== reply.id) {
      this.recordReplyLike.status = null;
    }
    if (this.recordReplyLike.status !== reply.isLiked) {
      this.recordReplyLike.status = reply.isLiked;
      this.recordReplyLike.id = reply.id;
    } else {
      return;
    }

    const params = {
      id: reply.id,
      isLiked: !reply.isLiked,
    };
    const { success, msg } = await this.props.comment.updateLiked(params);

    if (this.props.isPositionComment) {
      this.props.commentPosition.setReplyListDetailField(comment.id, reply.id, 'isLiked', params.isLiked);
      const likeCount = params.isLiked ? reply.likeCount + 1 : reply.likeCount - 1;
      this.props.commentPosition.setReplyListDetailField(comment.id, reply.id, 'likeCount', likeCount);
    } else {
      this.props.thread.setReplyListDetailField(comment.id, reply.id, 'isLiked', params.isLiked);
      const likeCount = params.isLiked ? reply.likeCount + 1 : reply.likeCount - 1;
      this.props.thread.setReplyListDetailField(comment.id, reply.id, 'likeCount', likeCount);
    }

    if (!success) {
      Toast.error({
        content: msg,
      });
    }
  }

  // 点击评论的删除
  async deleteClick(data) {
    this.commentData = data;
    this.setState({
      showDeletePopup: true,
    });
  }

  // 删除评论
  async deleteComment() {
    if (!this.commentData.id) return;

    const { success, msg } = await this.props.comment.delete(
      this.commentData.id,
      this.props.isPositionComment ? this.props.commentPosition : this.props.thread,
    );
    this.setState({
      showDeletePopup: false,
    });
    if (success) {
      Toast.success({
        content: '删除成功',
      });
      return;
    }
    Toast.error({
      content: msg,
    });
  }

  // 点击评论的回复
  replyClick(comment) {
    this.props.replyClick(comment);
  }

  // 点击回复的回复
  replyReplyClick(reply, comment) {
    this.props.replyReplyClick(reply, comment);
  }


  // 跳转评论详情
  onCommentClick(data) {
    if (data.id && this.props.thread?.threadData?.id) {
      Taro.navigateTo({
        url: `/indexPages/thread/comment/index?id=${data.id}&threadId=${this.props.thread?.threadData?.id}`,
      });
      // 清空@ren数据
      this.props.thread.setCheckUser([]);
    }
  }

  // 点击采纳
  onAboptClick(data) {
    typeof this.props.onAboptClick === 'function' && this.props.onAboptClick(data);
  }

  avatarClick(data) {
    const { userId } = data;
    if (!userId) return;
    Router.push({ url: `/userPages/user/index?id=${userId}` });
  }

  replyAvatarClick(reply, comment, floor) {
    this.props.replyAvatarClick(reply, comment, floor);
  }

  // 点击回复的删除
  async replyDeleteClick(reply, comment) {
    this.commentData = comment;
    this.replyData = reply;
    this.setState({
      showReplyDeletePopup: true,
    });
  }

  // 删除回复
  async replyDeleteComment() {
    if (!this.replyData.id) return;

    const params = {};
    if (this.replyData && this.commentData) {
      params.replyData = this.replyData; // 本条回复信息
      params.commentData = this.commentData; // 回复对应的评论信息
    }
    const { success, msg } = await this.props.comment.deleteReplyComment(
      params,
      this.props.isPositionComment ? this.props.commentPosition : this.props.thread,
    );
    this.setState({
      showReplyDeletePopup: false,
    });
    if (success) {
      Toast.success({
        content: '删除成功',
      });
      return;
    }
    Toast.error({
      content: msg,
    });
  }

  render() {
    let { totalCount, commentList } = this.props.thread;

    const { commentList: commentPositionList, postId } = this.props.commentPosition;
    if (this.props.isPositionComment) {
      commentList = commentPositionList || [];
    }

    // 是否作者自己
    const isSelf =
      this.props.user?.userInfo?.id && this.props.user?.userInfo?.id === this.props.thread?.threadData?.userId;

    const isReward = this.props.thread?.threadData?.displayTag?.isReward;

    const { indexes } = this.props.thread?.threadData?.content || {};

    const parseContent = parseContentData(indexes);
    const { isAnonymous } = this.props.thread?.threadData || '';

    return (
      <Fragment>
        {this.props.showHeader && (
          <View className={comment.header}>
            <View className={comment.number}>共{totalCount}条评论</View>
            <View className={comment.sort} onClick={() => this.onSortClick()}>
              <Icon className={comment.sortIcon} name="SortOutlined"></Icon>
              <Text className={comment.sortText}>{this.state.commentSort ? '评论从新到旧' : '评论从旧到新'}</Text>
            </View>
          </View>
        )}
        <View className={comment.body}>
          {commentList.map((val, index) => (
            <View
              className={`${comment.commentItems} ${index === commentList.length - 1 && comment.isLastOne}`}
              key={val.id || index}
              ref={val.id === postId ? this.props.positionRef : null}
              id={`position${val.id}`}
            >
              <CommentList
                data={val}
                key={val.id}
                likeClick={() => this.likeClick(val)}
                avatarClick={() => this.avatarClick(val)}
                replyClick={() => this.replyClick(val)}
                deleteClick={() => this.deleteClick(val)}
                replyLikeClick={(reploy) => this.replyLikeClick(reploy, val)}
                replyAvatarClick={(reply, floor) => this.replyAvatarClick(reply, val, floor)}
                replyReplyClick={(reploy) => this.replyReplyClick(reploy, val)}
                replyDeleteClick={(reply) => this.replyDeleteClick(reply, val)}
                onCommentClick={() => this.onCommentClick(val)}
                onAboptClick={() => this.onAboptClick(val)}
                isShowOne
                isShowAdopt={
                  // 是帖子作者 && 是悬赏帖 && 评论人不是作者本人
                  isSelf && isReward && this.props.thread?.threadData?.userId !== val.userId
                }
                threadId={this.props.thread.threadData.userId}
                active={val.id === postId}
                isAnonymous={isAnonymous}
                redPacketData = {parseContent?.RED_PACKET}
              ></CommentList>
            </View>
          ))}
        </View>

        {/* 删除弹层 */}
        <DeletePopup
          visible={this.state.showDeletePopup}
          onClose={() => this.setState({ showDeletePopup: false })}
          onBtnClick={() => this.deleteComment()}
        ></DeletePopup>

        {/* 删除回复弹层 */}
        <DeletePopup
          visible={this.state.showReplyDeletePopup}
          onClose={() => this.setState({ showReplyDeletePopup: false })}
          onBtnClick={() => this.replyDeleteComment()}
        />
      </Fragment>
    );
  }
}

RenderCommentList.defaultProps = {
  showHeader: true, // 是否显示排序头部
};


export default RenderCommentList;
