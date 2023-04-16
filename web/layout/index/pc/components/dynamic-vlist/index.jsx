import React, { Fragment } from 'react';
import NewContent from '../new-content';
import TopNews from '../../../h5/components/top-news';
import TopMenu from '../top-menu';
import { Button } from '@discuzqsdk/design';
import ThreadContent from '@components/thread';
import WindowVList from '@components/virtual-list/pc';
import styles from './index.module.scss';

import IndexToppingHooks from '@common/plugin-hooks/plugin_index@topping';
import IndexTabsHook from '@common/plugin-hooks/plugin_index@tabs';
// 引入海报
import QPosters from '@components/q-poster-s';

const TopFilterView = ({ onFilterClick, isShowDefault, onPostThread, ishide, site }) => {
  const component = (
    <div className={styles.topBox}>
      <TopMenu onSubmit={onFilterClick} isShowDefault={isShowDefault} />
      {/*<div className={styles.PostTheme}>
        <Button type="primary" className={styles.publishBtn} onClick={onPostThread}>
          发布
        </Button>
      </div>*/}
    </div>
  );

  const changeFilter = (params) => {
    const { types, sort, essence, attention, sequence } = params;
    const result = {
      sequence,
      filter: { types, sort, essence, attention },
    };
    onFilterClick(result);
  };

  return (
    <div className={styles.topWrapper} style={{ visibility: ishide ? 'hidden' : 'visible' }}>
      <IndexTabsHook changeFilter={(params) => changeFilter(params)} component={component}></IndexTabsHook>
    </div>
  );
};

export default class DynamicVList extends React.Component {
  constructor(props) {
    super(props);
  }

  // 中间 -- 筛选 置顶信息 是否新内容发布 主题内容
  renderContent = (data) => {
    const {
      visible,
      conNum,
      isShowDefault,
      onFilterClick,
      onPostThread,
      goRefresh,
      canPublish = () => {},
    } = this.props;
    const { sticks, threads } = data;
    const { pageData } = threads || {};

    return (
      <div className={styles.indexContent}>
        <TopFilterView onFilterClick={onFilterClick} onPostThread={onPostThread} isShowDefault={isShowDefault} />

        <div className={styles.contnetTop}>
          {sticks?.length > 0 && (
            <div className={`${styles.TopNewsBox} ${!visible && styles.noBorder}`}>
              <TopNews data={sticks} platform="pc" isShowBorder={false} />
            </div>
          )}
          {visible && (
            <div className={styles.topNewContent}>
              <NewContent visible={visible} conNum={conNum} goRefresh={goRefresh} />
            </div>
          )}
        </div>
        <div className={styles.themeBox}>
          <div className={styles.themeItem}>
            {pageData?.map((item, index) => (
              <ThreadContent
                key={`${item.threadId}-${item.createdAt || ''}-${item.updatedAt || ''}`}
                className={styles.threadContent}
                data={item}
                enableCommentList={true}
                canPublish={canPublish}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  renderTop = () => {
    const { onFilterClick, isShowDefault, onPostThread } = this.props;

    return (
      <TopFilterView
        onFilterClick={onFilterClick}
        onPostThread={onPostThread}
        isShowDefault={isShowDefault}
        ishide={false}
        site={this.props.siteStore}
      />
    );
  };

  renderVlist = (data) => {
    const {
      visible,
      conNum,
      isShowDefault,
      onFilterClick,
      onPostThread,
      goRefresh,
      loadNextPage,
      renderRight,
      renderLeft,
      requestError,
      noMore,
      errorText,
      onScroll = () => {},
      canPublish = () => {},
    } = this.props;
    const { sticks, threads } = data;
    const { pageData } = threads || {};
    const { siteStore } = this.props;
    const { countThreads = 0 } = siteStore?.webConfig?.other || {};

    const toppingComponent = (
      <div className={styles.contnetTop}>
        {sticks?.length > 0 && (
          <div className={`${styles.TopNewsBox} ${!visible && styles.noBorder}`}>
            <TopNews data={sticks} platform="pc" isShowBorder={false} />
          </div>
        )}
        {visible && (
          <div className={styles.topNewContent}>
            <NewContent visible={visible} conNum={conNum} goRefresh={goRefresh} />
          </div>
        )}
      </div>
    );

    return (
      <WindowVList
        list={pageData}
        sticks={sticks}
        platform="pc"
        pageName="home"
        onScroll={onScroll}
        loadNextPage={loadNextPage}
        noMore={noMore}
        requestError={requestError}
        errorText={errorText}
        left={renderLeft(countThreads)}
        right={renderRight()}
        //top={this.renderTop()}
        visible={visible}
        canPublish={canPublish}
        renderItem={(item, index, recomputeRowHeights, onContentHeightChange, measure) => {
          return (
            <ThreadContent
              onContentHeightChange={measure}
              onImageReady={measure}
              onVideoReady={measure}
              key={`${item.threadId}-${item.updatedAt}`}
              data={item}
              className={styles.listItem}
              recomputeRowHeights={measure}
            />
          );
        }}
      >
	    {/*幻灯海报组件*/}
	    <QPosters platform="pc"isShowBorder={false} />
        <div className={styles.indexContent}>
          <TopFilterView
            onFilterClick={onFilterClick}
            onPostThread={onPostThread}
            isShowDefault={isShowDefault}
            //ishide={true}
            site={this.props.siteStore}
          />

          <IndexToppingHooks component={toppingComponent} renderData={{ sticks }}></IndexToppingHooks>
        </div>
      </WindowVList>
    );
  };

  render() {
    const { indexStore } = this.props;

    return this.props.enabledVList ? this.renderVlist(indexStore) : this.renderContent(indexStore);
  }
}
