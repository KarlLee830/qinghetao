import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexH5Page from '@layout/my/like/h5';
import IndexPCPage from '@layout/my/like/pc';
import ViewAdapter from '@components/view-adapter';
import { readThreadList, readTopicsList } from '@server';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCWithLogin from '@middleware/HOCWithLogin';
import isServer from '@common/utils/is-server';
import { withRouter } from 'next/router';

@inject('site')
@inject('index')
@inject('search')
@inject('threadList')
@observer
class Index extends React.Component {
  page = 1;
  prePage = 10;
  // static async getInitialProps(ctx) {
  //   const result = await readTopicsList();
  //   const threads = await readThreadList(
  //     {
  //       params: {
  //         filter: {
  //           complex: 2,
  //         },
  //         perPage: 10,
  //       },
  //     },
  //     ctx,
  //   );

  //   return {
  //     serverIndex: {
  //       threads: threads && threads.code === 0 ? threads.data : null,
  //       totalPage: threads && threads.code === 0 ? threads.data.totalPage : null,
  //       totalCount: threads && threads.code === 0 ? threads.data.totalCount : null,
  //     },
  //     serverSearch: {
  //       topics: result?.data,
  //     },
  //   };
  // }

  constructor(props) {
    super(props);
    const { serverIndex, index, serverSearch, search, threadList } = this.props;
    this.state = {
      firstLoading: true, // 首次加载状态判断
      totalCount: 0,
      page: 1,
    };
    threadList.registerList({ namespace: 'like' });

    if (serverIndex && serverIndex.threads) {
      index.setThreads(serverIndex.threads);
      this.state.page = 2;
      this.state.totalPage = serverIndex.totalPage;
      this.state.totalCount = serverIndex.totalCount;
      this.state.firstLoading = false;
    } else {
      index.setThreads(null);
    }
    serverSearch && serverSearch.topics && search.setTopics(serverSearch.topics);
  }

  componentWillUnmount() {
    this.props.router.events.off('routeChangeStart', this.beforeRouterChange);
  }

  async componentDidMount() {
    this.props.router.events.on('routeChangeStart', this.beforeRouterChange);
    const { search, threadList } = this.props;
    const hasThreadsData = !!threadList.getList({ namespace: 'like' })?.length;

    // const hasTopics = !!search.topics;
    this.page = 1;
    if (!hasThreadsData) {
      const threadsResp = await threadList.fetchList({
        namespace: 'like',
        perPage: 10,
        filter: {
          complex: 2,
        },
      });

      threadList.setList({
        namespace: 'like',
        data: threadsResp,
      });

      this.setState({
        totalCount: threadsResp.data.totalCount,
        totalPage: threadsResp.data.totalPage,
      });

      if (this.state.page <= threadsResp?.data.totalPage) {
        this.setState({
          page: this.state.page + 1,
        });
      }
      this.setState({
        firstLoading: false,
      });
    }
    // if (!hasTopics) {
    //   await search.getTopicsList();
    // }
  }

  beforeRouterChange = (url) => {
    // 如果不是进入 thread 详情页面
    if (!/thread\//.test(url)) {
      this.clearStoreThreads();
    }
  };

  clearStoreThreads = () => {
    const { threadList } = this.props;
    threadList.clearList({ namespace: 'like' });
  };

  dispatch = async () => {
    const { threadList } = this.props;
    this.page += 1;
    const threadsResp = await threadList.fetchList({
      namespace: 'like',
      perPage: 10,
      filter: {
        complex: 2,
      },
    });

    threadList.setList({
      namespace: 'like',
      data: threadsResp,
    });

    if (this.state.page <= threadsResp.data.totalPage) {
      this.setState({
        page: this.state.page + 1,
      });
    }
  };

  render() {
    const { site } = this.props;
    const { platform } = site;
    const { firstLoading } = this.state;

    return (
      <ViewAdapter
        h5={
          <IndexH5Page
            firstLoading={firstLoading}
            page={this.state.page}
            totalPage={this.state.totalPage}
            totalCount={this.state.totalCount}
            dispatch={this.dispatch}
          />
        }
        pc={<IndexPCPage firstLoading={firstLoading} dispatch={this.dispatch} />}
        title={'我的点赞'}
      />
    );
  }
}

// eslint-disable-next-line new-cap
export default withRouter(HOCFetchSiteData(HOCWithLogin(Index)));
