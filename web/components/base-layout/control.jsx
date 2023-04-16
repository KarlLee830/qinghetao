import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { inject, observer } from 'mobx-react';
import { noop } from '@components/thread/utils';
import { throttle } from '@common/utils/throttle-debounce.js';


import H5BaseLayout from './h5';
import PCBaseLayout from './pc';

/**
* 集成布局交互逻辑控制，用于控制音视频播放、jump等有关scroll的布局操作
* @prop {function} onScroll 触发滚动函数
* @prop {boolean} quickScroll 是否加throttle给handleScroll
* @prop {boolean} hasListChild 页面是否有List组件
* @prop {boolean} jumpTo 跳转到List组件什么位置
* @prop {string} pageName 'home'是主页, 'search'是搜索页，用于记录当前页面阅读位置
* @prop {function}
* @example
*     <BaseLayout>
        <BaseLayoutControl>
        </BaseLayoutControl>
      </BaseLayout>
*/

const BaseLayoutControl = forwardRef((props, ref) => {
  const {
    site,
    baselayout = {},
    onScroll = noop,
    quickScroll = false,
    hasListChild = true,
    jumpTo = -1,
    pageName = '',
    ready = noop,
    jumpRuleList = [],
    ...others
  } = props;

  const [listRef, setListRef] = useState(null);
  
  const layoutRef = useRef(null);

  const disableEffect = useRef(false);

  useImperativeHandle(ref, () => ({
    listRef,
  }));

  const baseLayoutWhiteList = useMemo(() => {
    const defaultWhiteList = [
      'home',
      'search',
      'my',
      'like',
      'collect',
      'buy',
      'block',
      'draft',
      'resultTopic',
      'resultUser',
      'resultPost',
      'h5SearchResult',
      'topicDetail',
    ];
    if (Array.isArray(jumpRuleList)) {
      return [...defaultWhiteList, ...jumpRuleList];
    }
    return defaultWhiteList;
  }, [jumpRuleList]);

  useEffect(() => {
    ready();
  }, []);

  useEffect(() => {
    if (hasListChild) setListRef(layoutRef?.current.listRef);
  }, [layoutRef]);

  const isPageInWhiteList = () => {
    for (const listItem of baseLayoutWhiteList) {
      if (typeof listItem === 'string') {
        if (listItem === pageName) {
          return true;
        }
      } else if (typeof listItem.test === 'function') {
        if (listItem.test(pageName)) {
          return true;
        }
      }
    }
    return false;
  };

  useEffect(() => {
    if (!disableEffect.current) {
      handleListPosition()
    }
    disableEffect.current = false
  }, [listRef?.current]);

  useEffect(() => {
    handleListPosition()
  }, [jumpTo, hasListChild, pageName]);

  const handleListPosition = () => {
    if (hasListChild && listRef?.current && pageName && isPageInWhiteList()) {
      if (jumpTo > 0) {
        baselayout[pageName] = jumpTo;
        listRef.current.jumpToScrollTop(jumpTo);
      } else {
        if(baselayout[pageName] > 0) {
          // 需要异步触发，可能存在列表没有渲染出来
          setTimeout(() => {
            listRef.current.jumpToScrollTop(baselayout[pageName]);
          });
        } else if(baselayout.isJumpingToTop) {
          baselayout.removeJumpingToTop();
          listRef.current.onBackTop();
        }
      }
    }
  }

  const quickScrolling = (e) => {
    disableEffect.current = true

    if (!e || isNaN(e.scrollTop) || !hasListChild || !listRef?.current?.currentScrollTop) {
      onScroll();
      return;
    }
    const { scrollTop } = e;
    if (!isNaN(scrollTop) && pageName) baselayout[pageName] = scrollTop;

    const { playingVideoDom } = baselayout;

    if (playingVideoDom) {
      const playingVideoTop = baselayout.playingVideoPos;
      const playingVideoBottom = playingVideoDom.offsetHeight + playingVideoTop;

      if (
        playingVideoTop > 0 &&
        (playingVideoBottom < scrollTop || // 视频在视窗下面
          playingVideoTop > window.innerHeight + scrollTop)
      ) {
        // 视频在视窗上面
        baselayout.pauseWebPlayingVideo();
      }
    }

    const { playingAudioDom } = baselayout;
    if (playingAudioDom) {
      const playingAudioTop = baselayout.playingAudioPos;
      const playingAudioHeight = 56;
      const playingAudioBottom = playingAudioHeight + playingAudioTop;

      if (
        playingAudioTop > 0 &&
        (playingAudioBottom < scrollTop || // 音频在视窗下面
          playingAudioTop > window.innerHeight + scrollTop)
      ) {
        // 音频在视窗上面
        baselayout.pauseWebPlayingAudio();
      }
    }

    onScroll({ scrollTop });
  };

  const handleScroll = quickScroll ? quickScrolling : throttle(quickScrolling, 50);

  if (site.platform === 'pc') {
    return (
      <PCBaseLayout onScroll={handleScroll} pageName={pageName} platform={site.platform} {...others} ref={layoutRef} />
    );
  }

  return (
    <H5BaseLayout onScroll={handleScroll} pageName={pageName} platform={site.platform} {...others} ref={layoutRef} />
  );
});

export default inject('site', 'baselayout')(observer(BaseLayoutControl));
