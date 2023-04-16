import React, { createRef, Fragment } from 'react';
import { inject, observer, Observer } from 'mobx-react';
import { Icon, Tabs, Spin } from '@discuzqsdk/design';
// import ThreadContent from '@components/thread';
//引入头部
import QHomeHeader from '@components/q-home-header';
//引入海报
import QPosters from '@components/q-poster-s';
//import HomeHeader from '@components/home-header';
import styles from './index.module.scss';
import TopNew from './components/top-news';
import FilterView from './components/filter-view';
import BaseLayout from '@components/base-layout';
import { getSelectedCategoryIds } from '@common/utils/handleCategory';
import wxAuthorization from '../../user/h5/wx-authorization';
// import VList from '@components/virtual-list/h5/index';
import classnames from 'classnames';
// import DynamicVList from './components/dynamic-vlist';
import dynamic from 'next/dynamic';
import DynamicLoading from '@components/dynamic-loading';
import { debounce, throttle } from '@common/utils/throttle-debounce.js';
import Autoplay from '@common/utils/autoplay';
import PacketOpen from '@components/red-packet-animation/h5';
import ThreadContent from '@components/thread/SSRAdapter';
import SiteMapLink from '@components/site-map-link';

import IndexToppingHooks from '@common/plugin-hooks/plugin_index@topping';
import IndexHeaderHooks from '@common/plugin-hooks/plugin_index@header';
import IndexTabsHook from '@common/plugin-hooks/plugin_index@tabs';

@inject('site')
@inject('user')
@inject('index')
@inject('thread')
@inject('baselayout')
@observer
class IndexH5Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      isFinished: true,
      fixedTab: false,
    };
    this.listRef = createRef();
    // 用于获取顶部视图的高度
    this.headerRef = createRef(null);

    // 是否开启虚拟滚动
    this.enableVlist = true;
    this.handleScroll = this.handleScroll.bind(this);
    this.onRefresh = this.onRefresh.bind(this);

    const isAutoplay = this.props.site?.webConfig?.qcloud?.qcloudVodAutoPlay || false;
    if (isAutoplay) {
      this.autoplay = new Autoplay({ platform: 'h5' });
    }
  }

  DynamicVListLoading = dynamic(() => import('./components/dynamic-vlist'), {
    loading: (res) => (
      <div>
        {/* 顶部插件hooks */}
		<QHomeHeader ref={this.headerRef} />
        {/*<div ref={this.headerRef}>
          <IndexHeaderHooks  component={<HomeHeader />}></IndexHeaderHooks>
        </div>*/}
        <DynamicLoading
          data={res}
          style={{ padding: '0 0 20px' }}
          loadComponent={
            <div style={{ width: '100%' }}>
              <div className={styles.placeholder}>
                <div className={styles.header}>
                  <div className={styles.avatar} />
                  <div className={styles.box} />
                </div>
                <div className={styles.content} />
                <div className={styles.content} />
                <div className={styles.footer}>
                  <div className={styles.box} />
                  <div className={styles.box} />
                  <div className={styles.box} />
                </div>
              </div>
              <div className={styles.placeholder}>
                <div className={styles.header}>
                  <div className={styles.avatar} />
                  <div className={styles.box} />
                </div>
                <div className={styles.content} />
                <div className={styles.content} />
                <div className={styles.footer}>
                  <div className={styles.box} />
                  <div className={styles.box} />
                  <div className={styles.box} />
                </div>
              </div>
            </div>
          }
        />
      </div>
    ),
  });

  componentDidMount() {
    // 是否有推荐
    const isDefault = this.props.site.checkSiteIsOpenDefautlThreadListData();
    this.props.index.setNeedDefault(isDefault);
  }

  // 点击更多弹出筛选
  searchClick = () => {
    this.setState({ visible: true });
  };
  // 关闭筛选框
  onClose = () => {
    this.setState({ visible: false });
  };

  // 点击底部tabBar
  onClickTabBar = (data, index) => {
    if (index !== 0) {
      return;
    }
    this.changeFilter();
  };

  onClickTab = (id = '') => {
    this.changeFilter({ categoryids: [id], sequence: id === 'default' ? 1 : 0 });
  };

  changeFilter = (params) => {
    const { index, dispatch = () => {} } = this.props;

    if (params) {
      const { categoryids } = params;
      const categories = index.categories || [];

      // 获取处理之后的分类id
      const id = categoryids[0];
      const newCategoryIds = getSelectedCategoryIds(categories, id);

      const newFilter = { ...index.filter, ...params, categoryids: newCategoryIds };

      index.setFilter(newFilter);
    }

    dispatch('click-filter');

    this.setState({ visible: false });
  };

  // 上拉加载更多
  onRefresh = () => {
    const { dispatch = () => {} } = this.props;
    if (!this.props.index?.threads?.pageData?.length) return; // 防止第一页还没加载出来，用户使劲滚动页面到底部触发请求第二页
    return dispatch('moreData');
  };

  // 视频播放
  checkVideoPlay = debounce((startNum, stopNum) => {
    this.autoplay?.checkVideoPlay(startNum, stopNum);
  }, 1000);

  // 视频暂停
  checkVideoPlause = throttle(() => {
    this.autoplay?.checkVideoPlause();
  }, 50);

  handleScroll = ({ scrollTop = 0, startNum, stopNum } = {}) => {
    const height = this.headerRef.current?.clientHeight || 180;
    const { fixedTab } = this.state;

    this.checkVideoPlause();
    this.checkVideoPlay(startNum, stopNum);

    // 只需要滚到临界点触发setState，而不是每一次滚动都触发
    if (!fixedTab && scrollTop >= height) {
      this.setState({ fixedTab: true });
    } else if (fixedTab && scrollTop < height) {
      this.setState({ fixedTab: false });
    }
  };

  renderTabs = () => {
    const { fixedTab } = this.state;
    const { categories = [], activeCategoryId, currentCategories } = this.props.index;

    const component = categories?.length > 0 && (
      <>
        <div ref={this.listRef} className={`${styles.homeContent} ${!this.enableVlist && fixedTab && styles.fixed}`}>
          <Tabs
            className={styles.tabsBox}
            scrollable
            type="primary"
            onActive={this.onClickTab}
            activeId={activeCategoryId}
            tabBarExtraContent={
              <div onClick={this.searchClick} className={styles.tabIcon}>
                <Icon name="SecondaryMenuOutlined" className={styles.buttonIcon} size={16} />
              </div>
            }
          >
            {currentCategories?.map((item, index) => (
              <Tabs.TabPanel key={index} id={item.pid} label={item.name} />
            ))}
          </Tabs>
        </div>
        {!this.enableVlist && fixedTab && <div className={styles.tabPlaceholder}></div>}
      </>
    );

    return (
      <IndexTabsHook
        component={component}
        changeFilter={params => this.changeFilter(params)}
        renderData={{
          categories,
        }}
      ></IndexTabsHook>
    );
  };

  renderHeaderContent = () => {
    const { sticks = [] } = this.props.index || {};

    const component = (
      <>
        {sticks?.length > 0 && (
          <div className={styles.homeContentTop}>
            <TopNew data={sticks} itemMargin="1" />
          </div>
        )}
      </>
    );

    return <IndexToppingHooks component={component} renderData={{ sticks }}></IndexToppingHooks>;
  };

  renderSSRContent(thread, sticks) {
    if (process.env.DISCUZ_RUN === 'ssr' && ThreadContent) {
      const { pageData } = thread;

      return (
        <div className="ssr-box" style={{ display: 'none' }}>
          {/*<IndexHeaderHooks site={this.props.site} component={<HomeHeader />}></IndexHeaderHooks>*/}
          {this.renderTabs()}
          {this.renderHeaderContent()}
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
    const { index, thread } = this.props;
    const { hasRedPacket } = thread;

    const { isFinished } = this.state;
    const { threads = {}, currentCategories, activeCategoryId, filter, threadError, sticks } = index;
    const { currentPage, totalPage, pageData } = threads || {};

    return (
      <BaseLayout
        showHeader={false}
        showTabBar={!hasRedPacket}
        onRefresh={this.onRefresh}
        noMore={currentPage >= totalPage}
        isFinished={isFinished}
        onScroll={this.handleScroll}
        quickScroll={true}
        curr="home"
        pageName="home"
        requestError={threadError.isError}
        errorText={threadError.errorText}
        onClickTabBar={this.onClickTabBar}
        disabledList={this.enableVlist}
      >
        <Fragment>
          <div className={classnames(styles.vTabs, 'text', this.state.fixedTab && styles.vFixed)}>
            {this.renderTabs()}
          </div>
          {this.renderSSRContent(index.threads, index.sticks)}
          <this.DynamicVListLoading
            pageData={pageData}
            sticks={sticks}
            onScroll={this.handleScroll}
            loadNextPage={this.onRefresh}
            noMore={currentPage >= totalPage}
            requestError={threadError.isError}
            errorText={threadError.errorText}
            platform={'h5'}
          >
            {/* 头部插件hooks */}
            {/*<div ref={this.headerRef}>
              <IndexHeaderHooks component={<HomeHeader />}></IndexHeaderHooks>
            </div>*/}
			<QHomeHeader ref={this.headerRef} onClickTab={this.onClickTab}/>

            <Observer>{() => this.renderTabs()}</Observer>

			{activeCategoryId === 'all' && <QPosters />}
            <Observer>{() => this.renderHeaderContent()}</Observer>
          </this.DynamicVListLoading>
        </Fragment>

        <FilterView
          data={currentCategories}
          typelist={this.props.index.threadTypelist}
          current={filter}
          onCancel={this.onClose}
          visible={this.state.visible}
          onSubmit={this.changeFilter}
        />

        {hasRedPacket > 0 && <PacketOpen onClose={() => thread.setRedPacket(0)} money={hasRedPacket} />}
      </BaseLayout>
    );
  }
}

export default IndexH5Page;
