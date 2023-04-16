import React from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import { Toast } from '@discuzqsdk/design';
import goToLoginPage from '@common/utils/go-to-login-page';
import ViewMore from '@components/view-more';
import LoadingTips from '@components/thread-detail-pc/loading-tips';
import BottomView from '@components/list/BottomView';
import CommentInput from './comment-input';
import CommentList from './comment-list';
import Operate from './operate';
import typeofFn from '@utils/typeof';
import HOCTencentCaptcha from '@middleware/HOCTencentCaptcha';


// 评论
@inject('user')
@inject('site')
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
  async onPublishClick(val = '', imageList = []) {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    const valuestr = val.replace(/\s/g, '');
    // 如果内部为空，且只包含空格或空行
    if (!valuestr && imageList.length === 0) {
      Toast.info({ content: '请输入内容' });
      return;
    }

    const params = {
      val,
      imageList,
    }

    //  验证码
    const { webConfig } = this.props.site;
    if (webConfig) {
      const qcloudCaptcha = webConfig?.qcloud?.qcloudCaptcha;
      const createThreadWithCaptcha = webConfig?.other?.createThreadWithCaptcha;
      // 开启了腾讯云验证码验证时，进行验证，通过后再进行实际的发布请求

      if (qcloudCaptcha && createThreadWithCaptcha) {
        // 验证码票据，验证码字符串不全时，弹出滑块验证码
        const { captchaTicket, captchaRandStr } = await this.props.showCaptcha();
        if (!captchaTicket && !captchaRandStr) {
          return false ;
        }
        params.captchaTicket = captchaTicket;
        params.captchaRandStr = captchaRandStr;
      }
    }

    return await this.createComment(params);
  }

  // 创建评论
  async createComment({val, imageList, captchaTicket = '', captchaRandStr = ''}) {
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

      this.setState({
        inputValue: '',
      });
      return true;
    }
    Toast.error({
      content: msg,
    });
  }

  onViewMoreClick = () => {
    typeofFn.isFunction(this.props.onViewMoreClick) && this.props.onViewMoreClick();
  }


  render() {
    const { thread, userInfo, canPublish, commentList, deleteComment, isLoading, requestError, postCount, platform } = this.props;

    return <>
      {
        commentList && <CommentList
          thread={thread}
          canPublish={canPublish}
          commentList={commentList}
          deleteComment={deleteComment}
          platform={platform}
          showCaptcha={this.props.showCaptcha}>
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

      <CommentInput userInfo={userInfo} onSubmit={val => this.onPublishClick(val)} platform={platform}></CommentInput>
    </>;
  }
}

export default HOCTencentCaptcha(Comment);
