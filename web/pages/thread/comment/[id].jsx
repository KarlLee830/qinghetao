import React from 'react';
import { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { readCommentDetail } from '@server';
import CommentH5Page from '@layout/thread/comment/h5';
import CommentPCPage from '@layout/thread/comment/pc';
import ErrorPCPage from '@layout/error/pc';
import ErrorH5Page from '@layout/error/h5';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCWithLogin from '@middleware/HOCWithLogin';
import Router from '@discuzqsdk/sdk/dist/router';
import ViewAdapter from '@components/view-adapter';

@inject('site')
@inject('comment')
@inject('thread')
@observer
class CommentDetail extends React.Component {
  static async getInitialProps(ctx) {
    const id = ctx?.query?.id;
    if (!id) {
      return {
        props: {
          serverData: null,
        },
      };
    }
    // 获取评论数据
    const res = await readCommentDetail({ params: { postId: id } });
    return {
      props: {
        serverData: res.data,
      },
    };
  }

  constructor(props) {
    super(props);
    const { serverData, comment } = this.props;

    // 初始化数据到store中
    serverData && comment.setCommentDetail(serverData);

    this.state = {
      isServerError: false,
      serverErrorMsg: '',
    };
  }

  async componentDidMount() {
    const { id, threadId, postId } = this.props.router.query;
    // 判断缓存
    const oldId = this.props?.comment?.commentDetail?.id;
    if (Number(id) === oldId && id && oldId) {
      return;
    }
    this.props.comment.reset();

    if (threadId) {
      this.props.comment.setThreadId(threadId);
    }

    // 获取帖子数据
    const oldThreadId = this.props?.thread?.threadData?.threadId;
    if (!(threadId && oldThreadId && Number(threadId) === oldThreadId)) {
      const res = await this.props.thread.fetchThreadDetail(threadId);
      this.props.thread.loadCommentList({id: threadId, page: 1});

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

    if (!this.props.serverData && id) {
      const res = await this.props.comment.fetchCommentDetail(id);
      // 异常处理
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

      // 获取作者信息
      const { site } = this.props;
      const { platform } = site;
      const userId = this.props.comment?.commentDetail?.userId;
      if (platform === 'pc' && userId) {
        this.props.comment.fetchAuthorInfo(userId);
      }
    }
  }

  render() {
    const { site } = this.props;
    const { platform } = site;
    if (this.state.isServerError) {
      return platform === 'h5' ? (
        <ErrorH5Page text={this.state.serverErrorMsg} />
      ) : (
        <ErrorPCPage text={this.state.serverErrorMsg} />
      );
    }

    return (
      <ViewAdapter
        h5={<CommentH5Page canPublish={this.props.canPublish} />}
        pc={<CommentPCPage canPublish={this.props.canPublish} />}
      />
    );
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(withRouter(CommentDetail));
