import React from 'react';
import { inject, observer } from 'mobx-react';
import Toast from '@discuzqsdk/design/dist/components/toast';
import goToLoginPage from '@common/utils/go-to-login-page';
import { toTCaptcha } from '@common/utils/to-tcaptcha';
import ViewMore from '@components/view-more';
import LoadingTips from '@layout/thread/components/loading-tips';
import BottomView from '@components/list/BottomView';
import CommentInput from './comment-input';
import CommentList from './comment-list';
import Operate from './operate';
import styles from './index.module.scss';

// 评论
@inject('user')
@observer
class Comment extends React.Component {
  constructor(props) {
    super(props);

    this.operate = new Operate({
      list: this.props.commentList,
      threadData: this.props.thread?.threadData,
    });
  }

  // 点击发布按钮
  async onPublishClick(data) {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }
    return await this.createComment(data);
  }

  // 创建评论
  async createComment({ val, imageList = [], captchaTicket = '', captchaRandStr = '' }) {
    const id = this.props.thread?.threadData?.id;

    const params = {
      id,
      content: val,
      // postId: this.props.thread?.threadData?.postId,
      sort: this.commentDataSort, // 目前的排序
      isNoMore: this.props?.thread?.isNoMore,
      attachments: [],
      captchaTicket,
      captchaRandStr,
    };

    if (imageList?.length) {
      params.attachments = imageList
        .filter(item => item.status === 'success' && item.response)
        .map((item) => {
          const { id } = item.response;
          return {
            id,
            type: 'attachments',
          };
        });
    }
    this.operate.updateList(this.props.commentList);
    const { success, msg, isApproved, redPacketAmount } = await this.operate.createComment(params);
    this.props.createComment && this.props.createComment();
    if (success) {
      if (isApproved) {
        Toast.success({
          content: msg,
        });
      } else {
        Toast.warning({
          content: msg,
        });
      }

      if (redPacketAmount && redPacketAmount > 0) {
        this.props.threadStore.setRedPacket(redPacketAmount);
      }

      // 更新帖子中的评论数据
      // this.props.thread.updatePostCount(this.props.thread.totalCount);
      // 更新列表store数据
      // this.props.thread.updateListStore(this.props.index, this.props.search, this.props.topic);

      // 是否红包帖
      // const isRedPack = this.props.thread?.threadData?.displayTag?.isRedPack;
      // TODO:可以进一步细化判断条件，是否还有红包
      // if (isRedPack) {
      //   // 评论获得红包帖，更新帖子数据
      //   this.props.thread.fetchThreadDetail(id);
      // }
      return true;
    }
    Toast.error({
      content: msg,
    });
  }

  onViewMoreClick = () => {
    typeof this.props.onViewMoreClick === 'function' && this.props.onViewMoreClick();
  }


  render() {
    const { thread, userInfo, canPublish, commentList, deleteComment, isLoading, requestError, postCount, shareClickRandom } = this.props;

    return <>
      {
        commentList && <CommentList
          thread={thread}
          canPublish={canPublish}
          commentList={commentList}
          deleteComment={deleteComment}>
        </CommentList>
      }

      {isLoading ? (
        <LoadingTips type="init"></LoadingTips>
      ) : (
        requestError?.isError && <BottomView isError={requestError.isError}></BottomView>
      )}

      {postCount > 10 && (
        <ViewMore className={styles.viewMore} onClick={this.onViewMoreClick}></ViewMore>
      )}

      <CommentInput mark={'card'} threadId={thread?.threadData?.id} emojihide={shareClickRandom} userInfo={userInfo} onSubmit={data => this.onPublishClick(data)}></CommentInput>
    </>;
  }
}

export default Comment;
