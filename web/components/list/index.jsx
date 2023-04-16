import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { noop, isPromise } from '@components/thread/utils';
import styles from './index.module.scss';
import BottomView from './BottomView';
import { inject, observer } from 'mobx-react';
import backtoTopFn from '@common/utils/backto-top';
import Copyright from '@components/copyright';

/**
 * 列表组件，集成上拉刷新能力
 * @prop {function} className 容器样式，用于确定list高度；必传
 * @param {string} noMore 无更多数据
 * @prop {function} onRefresh 触底触发事件，需返回promise；若没有声明onRefresh，不触发上拉刷新。
 * @prop {function} onScroll 滑动事件
 * @prop {string} wrapperClass 内部元素className
 * @prop {boolean} showRefresh 是否展示loading视图
 * @prop {function} onError 当onRefresh返回reject时，触发回调
 * @prop {boolean} enableError 是否启用reject捕获
 * @prop {boolean} immediateCheck 初始化的时候，是否立即请求一次
 * @prop {function} resetList 初始化list状态
 */

const List = forwardRef(({
  height,
  className = '',
  wrapperClass = '',
  children,
  noMore,
  onRefresh,
  onScroll = noop,
  showRefresh = true,
  preload = 1000,
  onError = noop,
  enableError = false,
  immediateCheck = true,
  requestError = false,
  errorText = '加载失败',
  platform = '',
  showLoadingInCenter = true,
  site,
  hideCopyright = false,
}, ref) => {
  const listWrapper = useRef(null);
  const currentScrollTop = useRef(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errText, setErrText] = useState(errorText);
  const [isLoadingInCenter, setIsLoadingInCenter] = useState(false);

  // 提前加载
  const isH5 = site?.platform === 'h5';
  preload = !isH5 ? 3000 : 1000;

  useEffect(() => {
    if (noMore) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [noMore]);

  useEffect(() => {
    // 初始化的时候，是否立即请求一次
    if (immediateCheck && typeof(onRefresh) === 'function') {
      onRefresh();
    }
  }, []);

  // 当list内容高度，没有超过list高度，则将loading居中显示
  useEffect(() => {
    // 约束，只有在H5端，加载中的状态才会生效此样式
    if (listWrapper.current && showLoadingInCenter && !noMore && !isError && site?.platform === 'h5') {
      const { clientHeight } = listWrapper.current;
      const { scrollHeight } = listWrapper.current;

      setIsLoadingInCenter(scrollHeight <= clientHeight);
    } else {
      setIsLoadingInCenter(false);
    }
  }, [listWrapper.current, children, noMore]);

  useEffect(() => {
    setIsError(requestError);
  }, [requestError]);

  useEffect(() => {
    setErrText(errorText);
  }, [errorText]);

  // 移动端没有更多内容样式才有下划线
  const noMoreType = useMemo(() => (isH5 ? 'line' : 'normal'), [site.platform]);

  useImperativeHandle(
    ref,
    () => ({
      onBackTop,
      jumpToScrollTop,
      currentScrollTop,
      isLoading,
      resetList,
      listWrapper,
    }),
  );

  const resetList = () => {
    setIsLoading(false);
    setIsError(false);
  };

  const throttle = (fn, delay) => {
    let timer = null;

    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  };

  const onBackTop = () => {
    backtoTopFn(listWrapper.current.scrollTop, (top) => {
      listWrapper.current.scrollTop = top;
      currentScrollTop.current = top;
    });
  };

  const jumpToScrollTop = (scrollTop) => {
    if (scrollTop && scrollTop > 0) {
      listWrapper.current.scrollTop = scrollTop;
      currentScrollTop.current = scrollTop;
    }
  };
  const onTouchMove = throttle(({ isFirst = false }) => {
    if (!listWrapper || !listWrapper.current) {
      onScroll();
      return;
    }

    const { clientHeight } = listWrapper.current;
    const { scrollHeight } = listWrapper.current;
    const { scrollTop } = listWrapper.current;

    // 滑动事件
    onScroll({ scrollTop });
    currentScrollTop.current = scrollTop;

    if (!onRefresh) return;

    // 处理首页筛选，更新数据的时候，会触发一次上拉刷新
    let allowHandleRefresh = true;
    if (!isFirst) {
      allowHandleRefresh = (scrollTop !== 0);
    }

    // if (((scrollTop + clientHeight) >= scrollHeight / 2) && !isLoading && allowHandleRefresh) {
    if ((scrollHeight - preload <= clientHeight + scrollTop) && !isLoading && allowHandleRefresh) {
    // if ((scrollHeight/scrollTop <= 1.5) && !isLoading && allowHandleRefresh) {
      setIsLoading(true);
      if (typeof(onRefresh) === 'function') {
        const promise = onRefresh();
        isPromise(promise) && promise
          .then(() => {
            // 解决因promise和react渲染不同执行顺序导致重复触发加载数据的问题
            setTimeout(() => {
              setIsLoading(false);
              if (noMore) {
                setIsLoading(true);
              }
            }, 0);
          })
          .catch((err) => {
            setIsLoading(true);
            setIsError(true);
            setErrText(err || '加载失败');
            onError(err);
          });
      } else {
        console.error('上拉刷新，必须返回promise');
      }
    }
  }, 0);

  // 网络请求失败
  const handleError = () => {
    // setIsLoading(false);
    // setTimeout(() => {
    //   onTouchMove();
    // }, 0)
  };

  const renderPC = () => (
    <div className={`${styles.container} ${className} ${styles.pc}`} style={{ height }}>
      <div
        className={`${styles.wrapper} ${wrapperClass} ${isLoadingInCenter ? styles.wrapperH5Center : ''}`}
        ref={listWrapper}
        onScroll={onTouchMove}
      >
        {children}
        {onRefresh && showRefresh && <BottomView isError={isError} errorText={errText} noMore={noMore} handleError={handleError} noMoreType={noMoreType} />}
      </div>
    </div>
  );

  const renderH5 = () => (
    <div className={`${styles.container} ${className} ${styles.h5}` } style={{ height }}>
      <div
        className={`${styles.wrapper} ${wrapperClass} ${styles.hideScrollBar} ${isLoadingInCenter ? styles.wrapperH5Center : ''}`}
        ref={listWrapper}
        onScroll={onTouchMove}
      >
        <div>
          {children}
          {onRefresh && showRefresh && <BottomView isError={isError} errorText={errText} noMore={noMore} handleError={handleError} noMoreType={noMoreType} />}
        </div>
        { !hideCopyright && <Copyright marginTop={0} /> }
      </div>
    </div>
  );

  return isH5 ? renderH5() : renderPC();
});

// export default React.memo(List);
export default inject('site')(observer(List));
