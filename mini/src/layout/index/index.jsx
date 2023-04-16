import React, { createRef } from 'react';
import { inject, observer } from 'mobx-react';
import { View } from '@tarojs/components';
import { getSelectedCategoryIds } from '@common/utils/handleCategory';
import Taro from '@tarojs/taro';
import { debounce } from '@common/utils/throttle-debounce.js';
import styles from './index.module.scss';
import ThreadContent from '@components/thread';
import HomeHeader from '@components/home-header';
import BaseLayout from '@components/base-layout';
import ThreadList from '@components/virtual-list';
import PacketOpen from '@components/red-packet-animation';
import IndexTabs from './components/tabs';
import TopNew from './components/top-news';
import FilterView from './components/filter-view';
import QHomeHeader from '@components/q-home-header';
import IndexHeaderHooks from '@common/plugin-hooks/plugin_index@header';
import IndexToppingHooks from '@common/plugin-hooks/plugin_index@topping';
import IndexTabsHook from '@common/plugin-hooks/plugin_index@tabs';
import QPoster from '@components/q-poster';

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
      filter: {},
      currentIndex: 'all',
      isFinished: true,
      isClickTab: false,
      windowHeight: 0,
    };
    this.tabsRef = createRef(null);
    this.headerRef = createRef(null);
    this.isNormal = false;
  }

  setNavigationBarStyle = () => {
    Taro.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#000000',
    });
  };
  componentDidMount() {
    // 是否有推荐
    const isDefault = this.props.site.checkSiteIsOpenDefautlThreadListData();
    this.props.index.setNeedDefault(isDefault);
  }

  // 点击更多弹出筛选
  searchClick = () => {
    this.props.index.setHiddenTabBar(true);

    this.setState({ visible: true });
  };
  // 关闭筛选框
  onClose = () => {
    this.props.index.setHiddenTabBar(false);

    this.setState({ visible: false });
  };

  onClickTab = (id = '') => {
    this.changeFilter({ categoryids: [id], sequence: id === 'default' ? 1 : 0 });
  };

  handleClickTabBar = (item, idx) => {
    if (item?.router === '/indexPages/home/index') {
      // 点击首页刷新
      this.changeFilter();
    }
  };
  changeFilter = (params) => {
    this.props.index.resetErrorInfo();
    this.setState({ isClickTab: true });

    this.props.baselayout.setJumpingToTop();
    this.props.index.setHiddenTabBar(false);

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

    this.debounceDispatch();

    this.setState({ visible: false });
  };

  debounceDispatch = debounce(() => {
    const { dispatch = () => {} } = this.props;
    dispatch('click-filter').then(() => {
      this.setState({ isClickTab: false });
    });
  }, 200);

  // 上拉加载更多
  onRefresh = () => {
    const { dispatch = () => {} } = this.props;
    return dispatch('moreData');
  };

  handleScrollToUpper = () => {
    this.tabsRef?.current?.changeFixedTab();
  };

  renderHeaderContent = () => {
    const { sticks = [] } = this.props.index || {};

    const component = (
      <>
        {sticks && sticks.length > 0 && (
          <View className={styles.homeContentTop}>
            <TopNew data={sticks} itemMargin="1" />
          </View>
        )}
      </>
    );

    return <IndexToppingHooks component={component} renderData={{ sticks }}></IndexToppingHooks>;
  };

  render() {
    const { index, user, thread } = this.props;
    const { hasRedPacket } = thread;

    const { isFinished, isClickTab } = this.state;
    const { threads = {}, TwoDThreads, activeCategoryId, currentCategories, filter, threadError } = index;
    const { currentPage = 1, totalPage, pageData } = threads || {};

    hasRedPacket && index.setHiddenTabBar(true);

    return (
      <BaseLayout
        showHeader={false}
        showTabBar
        onRefresh={this.onRefresh}
        noMore={!isClickTab && currentPage >= totalPage}
        isFinished={isFinished}
        onScroll={this.handleScroll}
        onScrollToUpper={this.handleScrollToUpper}
        curr="home"
        pageName="home"
        preload={3000}
        requestError={threadError.isError}
        errorText={threadError.errorText}
        onClickTabBar={this.handleClickTabBar}
      >
        {/* 顶部插件hooks */}
        {/*<IndexHeaderHooks site={this.props.site} component={<HomeHeader />}></IndexHeaderHooks>*/}
        <QHomeHeader />

        <IndexTabsHook
          component={<IndexTabs onClickTab={this.onClickTab} searchClick={this.searchClick} ref={this.tabsRef} />}
          changeFilter={(params) => this.changeFilter(params)}
          renderData={{
            categories: index.categories,
          }}
        ></IndexTabsHook>
        {activeCategoryId === 'all' && <QPoster />}

        <View style={{ display: isClickTab ? 'none' : 'block' }}>
          {this.renderHeaderContent()}

          {!this.isNormal ? (
            <ThreadList data={TwoDThreads} isClickTab={isClickTab} wholePageIndex={currentPage - 1} />
          ) : (
            pageData?.map((item, index) => (
              <ThreadContent
                key={`${item.threadId}-${item.updatedAt}-${item._time}`}
                showBottomStyle={index !== pageData.length - 1}
                data={item}
                className={styles.listItem}
                enableCommentList={true}
              />
            ))
          )}
        </View>
        <FilterView
          data={currentCategories}
          typelist={this.props.index.threadTypelist}
          current={filter}
          onCancel={this.onClose}
          visible={this.state.visible}
          onSubmit={this.changeFilter}
          permissions={user.threadExtendPermissions}
        />
        {hasRedPacket > 0 && (
          <PacketOpen
            money={hasRedPacket}
            onClose={() => {
              thread.setRedPacket(0);
              index.setHiddenTabBar(false);
            }}
          />
        )}
      </BaseLayout>
    );
  }
}

export default IndexH5Page;
