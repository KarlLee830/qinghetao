import React, { useState, useCallback } from 'react';
import Taro, { useDidShow, useDidHide } from '@tarojs/taro';
import ThreadPost from '@layout/thread/post';
import Page from '@components/page';
import { THREAD_TYPE } from '@common/constants/thread-post';

const Index = () => {
  const [bottomHeight, setBottomHeight] = useState(0); // 手机软键盘弹起高度
  const [routerAction, setRouterAction] = useState(null); // 发帖插入项的路由行为

  // 滚动页面到指定视图位置
  const pageScrollTo = useCallback(({ selector = null, scrollTop = 0, duration = 500 } = {}) => {
    if (selector) {
      Taro.createSelectorQuery()
        .selectViewport()
        .scrollOffset()
        .select(selector)
        .boundingClientRect()
        .exec((res) => {
          if (!res[1]) return;
          const top = res[0].scrollTop + res[1]?.top - 100;
          setTimeout(() => {
            Taro.pageScrollTo({ scrollTop: top, duration });
          }, 0);
        })
    } else {
      setTimeout(() => {
        Taro.pageScrollTo({ scrollTop, duration });
      }, 0);
    }
  }, [])

  useDidShow(() => {
    // 监听键盘高度变化
    Taro.onKeyboardHeightChange(res => {
      setBottomHeight(res?.height || 0);
    });

    setBottomHeight(0);

    switch (routerAction) {
      case THREAD_TYPE.at:
      case THREAD_TYPE.topic:
        pageScrollTo();
        break;
      case THREAD_TYPE.goods:
        pageScrollTo({ selector: "#thread-post-product" });
        break;
    }
    setRouterAction(null);
  })

  useDidHide(() => {
    Taro.offKeyboardHeightChange(() => { });
  })

  return (
    <Page withLogin>
      <ThreadPost
        bottomHeight={bottomHeight}
        pageScrollTo={pageScrollTo}
        setRouterAction={value => setRouterAction(value)}
      />
    </Page>
  )
};

export default Index;
