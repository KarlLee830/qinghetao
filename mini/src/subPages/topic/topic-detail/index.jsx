import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexPage from '@layout/topic/topic-detail';
import { readTopicsList } from '@server';
// import Toast from '@discuzqsdk/design/dist/components/toast/index';
import { getCurrentInstance } from '@tarojs/taro';
import Page from '@components/page';
import withShare from '@common/utils/withShare/withShare'
import { priceShare } from '@common/utils/priceShare';
import { updateThreadAssignInfoInLists } from '@common/store/thread-list/list-business';

@inject('threadList')
@inject('topic')
@inject('index')
@inject('user')
@observer
@withShare()
class Index extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}

    this.props.threadList.registerList({ namespace: this.props.topic.namespace });
  }
  page = 1;
  perPage = 10;
  getShareData (data) {
    const { topic } = this.props
    const topicId = topic.topicDetail?.pageData[0]?.topicId || ''
    const defalutTitle = topic.topicDetail?.pageData[0]?.content || ''
    const defalutPath = `/subPages/topic/topic-detail/index?id=${topicId}`
    if(data.from === 'timeLine') {
      return {
        title:defalutTitle
      }
    }
    if (data.from === 'menu') {
      return {
        title:defalutTitle,
        path:defalutPath
      }
    }
    const { title, path, comeFrom, threadId, isAnonymous, isPrice } = data
    if(comeFrom && comeFrom === 'thread') {
      const { user } = this.props
      this.props.index.updateThreadShare({ threadId }).then(result => {
      if (result.code === 0) {
        updateThreadAssignInfoInLists(threadId, { updateType: 'share', updatedInfo: result.data, user: user.userInfo });
      }
    });
    }
    return priceShare({isPrice, isAnonymous, path}) || {
      title,
      path
    }
  }
  async componentDidMount() {
    const { topic } = this.props;
    const { id = '' } = getCurrentInstance().router.params;
    // if (!hasTopics) {
    //   this.toastInstance = Toast.loading({
    //     content: '加载中...',
    //     duration: 0,
    //   });
      topic.setTopicDetail(null)
      this.page = 1;
      try {
        await topic.getTopicsDetail({ perPage: this.perPage, page: this.page, topicId: id });
      }
      catch (errMsg){
        console.log(errMsg);
      }
      // this.toastInstance?.destroy();
    // }

  }

  dispatch = async () => {
    const { topic } = this.props;
    const { id = '' } = getCurrentInstance().router.params;
    this.page += 1;
    await topic.getTopicsDetail({perPage: this.perPage, page: this.page, topicId: id});
    return;
  }

  render() {
    return <Page><IndexPage dispatch={this.dispatch} /></Page>;
  }
}

// eslint-disable-next-line new-cap
export default Index;
