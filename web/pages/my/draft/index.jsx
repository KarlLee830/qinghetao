import React from 'react';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCWithLogin from '@middleware/HOCWithLogin';
import { inject, observer } from 'mobx-react';
import H5Page from '@layout/my/draft/h5';
import PCPage from '@layout/my/draft/pc';
import { THREAD_LIST_FILTER_COMPLEX } from '@common/constants/index';
import { Toast } from '@discuzqsdk/design';
import { withRouter } from 'next/router';
import ViewAdapter from '@components/view-adapter';

@inject('site')
@inject('index')
@inject('thread')
@observer
class Draft extends React.Component {
  page = 1;
  perPage = 10;
  componentDidMount() {
    this.props.router.events.on('routeChangeStart', this.beforeRouterChange);
    this.fetchData();
  }

  fetchData = async (isMore) => {
    const { index } = this.props;
    if (isMore) this.page += 1;
    else this.page = 1;
    await index.getReadThreadList({
      isDraft: true,
      page: this.page,
      perPage: this.perPage,
      filter: { complex: THREAD_LIST_FILTER_COMPLEX.draft },
    });
    return;
  }

  handleEdit = item => this.props.router.push(`/thread/post?id=${item.threadId}`);

  beforeRouterChange = (url) => {
    // 如果不是进入 发帖 页面
    if (!/thread\//.test(url)) {
      this.props.index.drafts = null;
    }
  };

  handleDelete = async (item) => {
    const { thread, index } = this.props;
    this.toastInstance = Toast.loading({
      content: '删除中...',
      duration: 0,
    });
    const res = await thread.delete(item.threadId);
    this.toastInstance?.destroy();
    if (res.code === 0) {
      const data = (index.drafts?.pageData || []).filter(elem => elem.threadId !== item.threadId);
      const total = index.drafts?.totalCount - 1;
      index.setDrafts({ ...index.drafts, totalCount: total, pageData: data });
    } else {
      Toast.error({ content: res.msg });
    }
  }

  componentWillUnmount() {
    this.props.router.events.off('routeChangeStart', this.beforeRouterChange);
  }

  render() {
    const { site } = this.props;
    const { platform } = site;


    return (
      <ViewAdapter
        h5={
          <H5Page
            dispatch={this.fetchData}
            onEdit={item => this.handleEdit(item)}
            onDelete={item => this.handleDelete(item)}
          />
        }
        pc={
          <PCPage
            dispatch={this.fetchData}
            onEdit={item => this.handleEdit(item)}
            onDelete={item => this.handleDelete(item)}
          />
        }
        title={'我的草稿箱'}
      />
    );
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(HOCWithLogin(withRouter(Draft)));
