import React from 'react';
import { inject, observer } from 'mobx-react';
import { Spin, Toast } from '@discuzqsdk/design';
import ThreadContent from '@components/thread';
import layout from './index.module.scss';
import NoData from '@components/no-data';
import SectionTitle from '@components/section-title';
import PopularContents from '../../../../search/h5/components/popular-contents';

const MAX_THREAD_COUNT = 10

@inject('site')
@inject('index')
@inject('forum')
@inject('search')
@inject('user')
@inject('invite')
@observer
class PartnerInviteHot extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: true,
      errText: '暂无数据',
      isHot: false, // 是否是热门内容列表
    }
  }

  async componentDidMount() {
    const { forum, search } = this.props;
    try {
      await this.initThreadList();
      this.setState({isLoading: false})
    } catch (e) {
      this.setState({
        isLoading: false,
        errText: e?.Message || e
      })
      Toast.error({
        content: e?.Message || e,
        hasMask: false,
        duration: 1000,
      });
    }
  }

  async initThreadList() {
    const { forum, search } = this.props;

    const INVITE_THREADLIST_SCOPE = 3;
    const threadList = await search.getThreadList({
      scope: INVITE_THREADLIST_SCOPE,
    });

    forum.setThreadsPageData(threadList);

    // 推荐内容数量大于0则title为精彩内容预览，否则为热门内容预览
    const isHot = !threadList?.pageData?.some(item => item.isSite);
    this.setState({
      isHot,
    });
  }

  render() {
    const { site, forum, unifyOnClick } = this.props;
    const { platform } = site;
    const { threadsPageData = [] } = forum;
    const { isLoading, errText, isHot } = this.state;

    const icon = { type: 3, name: isHot ? 'HotOutlined' : 'WonderfulOutlined' };
    const title = `${isHot ? '热门' : '精彩'}内容预览`

    if (platform === 'h5') {
      return (
        <div className={layout.hot}>
          <SectionTitle isShowMore={false} icon={icon} title={title} onShowMore={this.redirectToSearchResultPost} />
          {
            !isLoading && threadsPageData?.length
              ? <PopularContents onTextItemClick={unifyOnClick} data={threadsPageData} unifyOnClick={unifyOnClick} />
              : <></>
          }
          {
            !isLoading && !threadsPageData?.length
              ? <NoData />
              : <></>
          }
          {
            isLoading
              ? <div className={layout.spinner}>
                  <Spin type="spinner" />
                </div>
              : <></>
          }
        </div>
      )
    }
    return (
      <div className={layout.pc_hot}>
        <div className={layout.pc_hot_title}>
          <SectionTitle titleStyle={{padding: '24px 0'}} isShowMore={false} icon={icon} title={title} onShowMore={this.redirectToSearchResultPost} />
        </div>
        {
          threadsPageData?.length
            ? threadsPageData.map((item, index) => (
              <ThreadContent
                onTextItemClick={unifyOnClick}
                unifyOnClick={unifyOnClick}
                className={layout.threadContent}
                data={item}
                key={index}
              />
            ))
            : <></>
        }
        {
          !isLoading && !threadsPageData?.length
            ? <NoData text={errText}/>
            : <></>
        }
        {
          isLoading
            ? <div className={layout.spinner}>
                <Spin type="spinner" />
              </div>
            : <></>
        }
      </div>

    );
  }
}

export default PartnerInviteHot;
