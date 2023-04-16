import React from 'react';
import { inject } from 'mobx-react';
// import { ToastProvider } from '@discuzqsdk/design/dist/components/toast/ToastProvider';
import Page from '@components/page';
import Router from '@discuzqsdk/sdk/dist/router';
import { readCommentDetail } from '@server';
import { getCurrentInstance } from '@tarojs/taro';
import withShare from '@common/utils/withShare/withShare';
import CommentMiniPage from '../../../layout/thread/comment/index';
import ErrorMiniPage from '../../../layout/error/index';

@inject('site')
@inject('comment')
@inject('thread')
@withShare({})
class CommentDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isServerError: false,
      serverErrorMsg: '',
    };
  }



  async componentWillUnmount() {
    this.props.comment.reset();
  }

   // 页面分享
  getShareData(data) {
    return (
      {
        title: data.title,
        path:data.path,
      }
    );
  }

  async componentDidShow() {
    const { id, threadId, postId } = getCurrentInstance().router.params;

    if (threadId) {
      this.props.comment.setThreadId(threadId);
      const res = await this.props.thread.fetchThreadDetail(threadId);
      if (res.code !== 0) {
        // 404
        if (res.code === -4004) {
          Router.replace({ url: '/404' });
          return;
        }

        if (res.code > -5000 && res.code < -4000) {
          this.setState({
            serverErrorMsg: res.msg,
          });
        }

        this.setState({
          isServerError: true,
        });
        return;
      }
    }

    if (postId) {
      this.props.comment.setPostId(Number(postId));
    } else {
      this.props.comment.setPostId(null);
    }

    if (id) {
      const res = await readCommentDetail({
        params: {
          perPage: 20,
          postId: Number(id),
        },
      });

      if (res.code !== 0) {
        // 404
        if (res.code === -4004) {
          Router.replace({ url: '/subPages/404/index' });
          return;
        }

        if (res.code > -5000 && res.code < -4000) {
          this.setState({
            serverErrorMsg: res.msg,
          });
        }

        this.setState({
          isServerError: true,
        });
        return;
      }

      this.props.comment.setCommentDetail(res.data);
    }
  }

  render() {
    return this.state.isServerError ? (
      <ErrorMiniPage text={this.state.serverErrorMsg} />
    ) : (
      <Page>
        {/* <ToastProvider> */}
        <CommentMiniPage />
        {/* </ToastProvider> */}
      </Page>
    );
  }
}

// eslint-disable-next-line new-cap
export default CommentDetail;
