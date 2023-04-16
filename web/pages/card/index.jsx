import React from 'react';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import ErrorH5Page from '@layout/error/h5';
import { inject, observer } from 'mobx-react';
import { Toast } from '@discuzqsdk/design';
import Router from '@discuzqsdk/sdk/dist/router';
import Card from '../../layout/card';
@inject('card')
@inject('site')
@observer
class CreateCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isServerError: false,
      serverErrorMsg: '',
    };
  }
  async getPageDate(id) {
    // 获取帖子数据
    if (!this.props?.card?.threadData) {
      // TODO:这里可以做精细化重置
      const res = await this.props.card.fetchThreadDetail(id);
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

      // 判断是否审核通过
      const isApproved = (this.props.card?.threadData?.isApproved || 0) === 1;
      if (!isApproved) {
        const currentUserId = this.props.user?.userInfo?.id; // 当前登录用户
        const userId = this.props.card?.threadData?.user?.userId; // 帖子作者
        // 不是作者自己。跳回首页
        if (!currentUserId || !userId || currentUserId !== userId) {
          Toast.info({ content: '内容正在审核中，审核通过后才能正常显示!' });
          Router.redirect({ url: '/' });
          return;
        }
      }
    }
  }
  async componentDidMount() {
    const { threadId } = this.props.router.query;

    if (threadId) {
      await this.getPageDate(threadId);
    }
  }
  render() {
    const { router } = this.props;
    const { threadId, commentId, experience } = router?.query || '';
    const { site } = this.props;
    const { platform } = site;
    if (this.state.isServerError && platform === 'h5') {
      return (
        <ErrorH5Page text={this.state.serverErrorMsg} />
      );
    }
    return (
        <div>
          <Card threadId={threadId} commentId={commentId} experience={experience}></Card>
        </div>
    );
  }
}
// eslint-disable-next-line new-cap
export default HOCFetchSiteData(CreateCard);
