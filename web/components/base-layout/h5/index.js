/* eslint-disable react/display-name */
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import Header from '@components/header';
import List from '@components/list';
import BottomNavBar from '@components/bottom-nav-bar';
import { PullDownRefresh } from '@discuzqsdk/design';
import { noop } from '@components/thread/utils';
import BacktoTop from '@components/list/backto-top';
import styles from './index.module.scss';
import isServer from '@common/utils/is-server';
/**
* PC端集成布局组件
* @prop {function} children 内容区域中间视图组件
* @prop {function} showHeader 是否显示头部组件
* @prop {function} showTabBar 是否显示底部tabBar组件
* @prop {function} showPullDown 是否集成下拉刷新
* @prop {function} onPullDown 下拉刷新事件
* @prop {function} isFinished 是否完成下拉刷新
* @prop other List Props // List组件所有的属性
* @example
*     <BaseLayout>
        {(props) => <div>中间</div>}
      </BaseLayout>
*/

const BaseLayout = forwardRef((props, ref) => {
  const {
    showHeader = true,
    showTabBar = false,
    showPullDown = false,
    children = null,
    onPullDown,
    isFinished = true,
    curr,
    onScroll = noop,
    onClickTabBar = noop,
    immediateCheck = false,
    platform = 'h5',
    footer,
    disabledList = false,
  } = props;
  const winHeight = isServer() ? 667 : window.innerHeight;
  const [height, setHeight] = useState(600);

  const pullDownWrapper = useRef(null);
  const listRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  useImperativeHandle(ref, () => ({
    listRef,
  }));

  const handleBacktoTop = () => {
    listRef && listRef.current.onBackTop();
  };

  let content = showPullDown ? (
    <div className={styles.list} ref={pullDownWrapper}>
      <PullDownRefresh onRefresh={onPullDown} isFinished={isFinished} height={height}>
        <List {...props} className={styles.listHeight} ref={listRef}
          onScroll={({ scrollTop }) => {
            setScrollTop(scrollTop);
            onScroll({ scrollTop });
          }}
          platform={platform}>
          {typeof children === 'function' ? children({ ...props }) : children}
        </List>
      </PullDownRefresh>
    </div>
  ) : (
    <List
      {...props} // props的位置必须要在第一个，否则后面的参数可能被覆盖
      immediateCheck={immediateCheck}
      className={styles.list}
      ref={listRef}
      onScroll={({ scrollTop }) => {
        setScrollTop(scrollTop);
        onScroll({ scrollTop });
      }}
      platform={platform}
    >
      {typeof children === 'function' ? children({ ...props }) : children}
    </List>
  );

  if (disabledList) {
    content = typeof children === 'function' ? children({ ...props }) : children;
  }

  return (
    <div className={styles.container}>
      {showHeader && <Header />}
      {content}
      {footer}
      {scrollTop > winHeight * 2 && !disabledList && <BacktoTop showTabBar={showTabBar} h5 onClick={handleBacktoTop} />}
      {showTabBar && <BottomNavBar onClick={onClickTabBar} placeholder curr={curr} />}
    </div>
  );
});

export default BaseLayout;
