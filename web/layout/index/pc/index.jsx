import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import styles from './index.module.scss';
import BaseLayout from '@components/base-layout';
import Navigation from './components/navigation';
import QcCode from '@components/qcCode';
import Recommend from '@components/recommend';
import Copyright from '@components/copyright';
import { readThreadList } from '@server';
import deepClone from '@common/utils/deep-clone';
import { handleString2Arr, getSelectedCategoryIds } from '@common/utils/handleCategory';
import DynamicLoading from '@components/dynamic-loading';
import dynamic from 'next/dynamic';
import Placeholder from './components/dynamic-vlist/placeholder';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import { debounce, throttle } from '@common/utils/throttle-debounce.js';
import Autoplay from '@common/utils/autoplay';
import PacketOpen from '@components/red-packet-animation/web';
import ThreadContent from '@components/thread/SSRAdapter';
import TopNews from '../h5/components/top-news/SSRAdapter';

import IndexRecommendHook from '@common/plugin-hooks/plugin_index@recommend';
import IndexQrcodeHook from '@common/plugin-hooks/plugin_index@qrcode';
import IndexCopyrightHook from '@common/plugin-hooks/plugin_index@copyright';
import IndexLeftHook from '@common/plugin-hooks/plugin_index@left';
import IndexRightHook from '@common/plugin-hooks/plugin_index@right';

const DynamicVListLoading = dynamic(() => import('./components/dynamic-vlist'), {
  loading: (res) => {
    return (
      <div style={{ width: '100%', maxWidth: '1420px' }}>
        <DynamicLoading data={res} style={{ padding: '0 0 20px' }} loadComponent={<Placeholder />} />
      </div>
    );
  },
});

@inject('site')
@inject('user')
@inject('index')
@inject('thread')
@observer
class IndexPCPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      conNum: 0,
      // visibility: 'hidden',
      isShowDefault: this.checkIsOpenDefaultTab(),
    };

    // ssr情况下，不适用虚拟滚动，使用会默认滚动
    this.enabledVList = true; // 开启虚拟列表

    // 轮询定时器
    this.timer = null;

    // List组件ref
    this.listRef = React.createRef();

    this.onFilterClick = this.onFilterClick.bind(this);
    this.onPostThread = this.onPostThread.bind(this);
    this.goRefresh = this.goRefresh.bind(this);
    this.onPullingUp = this.onPullingUp.bind(this);
    this.renderLeft = this.renderLeft.bind(this);
    this.renderRight = this.renderRight.bind(this);

    const isAutoplay = this.props.site?.webConfig?.qcloud?.qcloudVodAutoPlay || false;
    if (isAutoplay) {
      this.autoplay = new Autoplay({ platform: 'pc' });
    }
  }

  componentDidMount() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      this.handleIntervalRequest();
    }, 30000);
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  handleIntervalRequest = () => {
    const { filter } = this.props.index;

    const { essence, attention, sort, sequence } = filter;

    const { totalCount: nowTotal = -1 } = this.props.index?.threads || {};

    let newTypes = handleString2Arr(filter, 'types');
    let categoryIds = handleString2Arr(filter, 'categoryids');

    if (nowTotal !== -1) {
      readThreadList({
        params: {
          perPage: 10,
          page: 1,
          filter: { categoryids: categoryIds, types: newTypes, essence, attention, sort },
          sequence,
        },
      }).then((res) => {
        const { totalCount = 0 } = res?.data || {};
        const newConNum = totalCount - nowTotal;
        const { conNum = 0, visible } = this.state;

        if (newConNum > conNum) {
          this.setState({
            visible: true,
            conNum: newConNum,
          });
        }
      });
    }
  };

  onSearch = (value) => {
    if (value) {
      this.props.router.push(`/search?keyword=${value || ''}`);
    }
  };

  // 上拉加载更多
  onPullingUp = () => {
    const { dispatch = () => {} } = this.props;

    if (!this.props.index?.threads?.pageData?.length) return; // 火狐浏览器会记录当前浏览位置。防止刷新页面触发载入第二页数据

    return dispatch('moreData');
  };

  onFilterClick = (result) => {
    const {
      sequence,
      filter: { types, sort, essence, attention },
    } = result;

    this.changeFilter({ types, sort, essence, attention, sequence });
  };

  onNavigationClick = ({ categoryIds }) => {
    const categories = this.props.index.currentCategories || [];
    // 获取处理之后的分类id
    const id = categoryIds[0];
    const newCategoryIds = getSelectedCategoryIds(categories, id);

    this.changeFilter({ categoryids: newCategoryIds });
  };

  changeFilter = (params) => {
    const { index, dispatch = () => {} } = this.props;

    if (params) {
      const newFilter = { ...index.filter, ...params };

      index.setFilter(newFilter);
    }

    dispatch('click-filter');

    this.setState({ visible: false });
  };

  goRefresh = () => {
    const { dispatch = () => {} } = this.props;
    dispatch('refresh-thread').then((res) => {
      this.setState({
        visible: false,
        conNum: 0,
      });
    });
  };

  // 发帖
  onPostThread = () => {
    if (this.props.canPublish('comment')) {
      this.props.router.push('/thread/post');
    }
  };

  // 左侧 -- 分类
  renderLeft = (countThreads = 0) => {
    const { currentCategories, activeCategoryId, activeChildCategoryId, categoryError } = this.props.index;
    const component = (
      <div className={styles.indexLeft}>
        <div className={styles.indexLeftBox}>
          <Navigation
            categories={currentCategories}
            defaultFisrtIndex={activeCategoryId}
            defaultSecondIndex={activeChildCategoryId}
            totalThreads={countThreads}
            onNavigationClick={this.onNavigationClick}
            isError={categoryError.isError}
            errorText={categoryError.errorText}
          />
        </div>
      </div>
    );
    return (
      <IndexLeftHook
        component={component}
        renderData={{
          categories: currentCategories,
          activeCategoryId,
          activeChildCategoryId,
          totalThreads: countThreads,
          isError: categoryError.isError,
          errorText: categoryError.errorText,
        }}
        onNavigationClick={this.onNavigationClick}
      ></IndexLeftHook>
    );
  };
  // 右侧 -- 二维码 推荐内容
  renderRight = (data) => {
    const { recommends, getRecommends } = this.props.index || {};
    const url = this.props.site?.webConfig?.setSite?.siteUrl;

    const component = (
      <div className={styles.indexRight}>
        <IndexRecommendHook
          component={<Recommend />}
          onGetRecommends={getRecommends}
          renderData={{ recommends }}
        ></IndexRecommendHook>
        <IndexQrcodeHook
          component={
            <div className={styles.indexRightCon}>
              <QcCode />
            </div>
          }
          renderData={{ url }}
        ></IndexQrcodeHook>
        <IndexCopyrightHook component={<Copyright />}></IndexCopyrightHook>
      </div>
    );

    return (
      <IndexRightHook
        component={component}
        onGetRecommends={getRecommends}
        renderData={{ recommends, url }}
      ></IndexRightHook>
    );
  };

  checkIsOpenDefaultTab() {
    return this.props.site.checkSiteIsOpenDefautlThreadListData();
  }

  // 视频播放
  checkVideoPlay = debounce((startNum, stopNum) => {
    this.autoplay?.checkVideoPlay(startNum, stopNum);
  }, 1000);

  // 视频暂停
  checkVideoPlause = throttle(() => {
    this.autoplay?.checkVideoPlause();
  }, 50);

  handleScroll = ({ startNum, stopNum } = {}) => {
    this.checkVideoPlause();
    this.checkVideoPlay(startNum, stopNum);
  };

  renderSSRContent(thread, sticks) {
    if (process.env.DISCUZ_RUN === 'ssr' && ThreadContent) {
      const { pageData } = thread;

      return (
        <div className="ssr-box" style={{ display: 'none' }}>
          {sticks && sticks.length > 0 && <TopNews data={sticks} platform="pc" isShowBorder={false} />}
          <div>
            {pageData &&
              pageData.length != 0 &&
              pageData.map((item, index) => {
                return (
                  <ThreadContent
                    onContentHeightChange={() => {}}
                    onImageReady={() => {}}
                    onVideoReady={() => {}}
                    key={`${item.threadId}-${item.updatedAt}`}
                    data={item}
                    recomputeRowHeights={() => {}}
                  />
                );
              })}
          </div>
        </div>
      );
    }
    return null;
  }

  render() {
    const { index, site, thread, canPublish } = this.props;
    const { hasRedPacket } = thread;
    const { countThreads = 0 } = site?.webConfig?.other || {};
    const { currentPage, totalPage } = index.threads || {};
    const { threadError } = index;
    const { visible, conNum, isShowDefault } = this.state;

    return (
      <BaseLayout
        onSearch={this.onSearch}
        onRefresh={this.onPullingUp}
        noMore={currentPage >= totalPage}
        onScroll={this.onScroll}
        quickScroll={true}
        showRefresh={false}
        left={this.renderLeft(countThreads)}
        right={this.renderRight()}
        pageName="home"
        requestError={threadError.isError}
        errorText={threadError.errorText}
        className="home"
        disabledList={this.enabledVList}
        onRefreshPlaceholder={this.onRefreshPlaceholder}
      >
        {this.renderSSRContent(index.threads, index.sticks, countThreads)}
        <DynamicVListLoading
          indexStore={index}
          siteStore={site}
          onScroll={this.handleScroll}
          visible={visible}
          conNum={conNum}
          noMore={currentPage >= totalPage}
          requestError={threadError.isError}
          errorText={threadError.errorText}
          isShowDefault={isShowDefault}
          onFilterClick={this.onFilterClick}
          onPostThread={this.onPostThread}
          goRefresh={this.goRefresh}
          loadNextPage={this.onPullingUp}
          renderRight={this.renderRight}
          renderLeft={this.renderLeft}
          enabledVList={this.enabledVList}
          canPublish={canPublish}
        />
        {hasRedPacket > 0 && <PacketOpen onClose={() => thread.setRedPacket(0)} money={hasRedPacket} />}
      </BaseLayout>
    );
  }
}
// eslint-disable-next-line new-cap
export default withRouter(IndexPCPage);
