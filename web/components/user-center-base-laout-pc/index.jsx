import React, { useCallback, useEffect, useMemo, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Flex, Icon, Spin } from '@discuzqsdk/design';
import Header from '@components/header';
import List from '@components/list';
import RefreshView from '@components/list/RefreshView';
import BacktoTop from '@components/list/backto-top';

import UserCenterHeaderImage from '@components/user-center-header-images';
import UserCenterHead from '@components/user-center-head';
import styles from './index.module.scss';
/**
* PC端集成布局组件
* @prop {function} header 头部视图组件
* @prop {function} left 内容区域左部视图组件
* @prop {function} children 内容区域中间视图组件
* @prop {function} right 内容区域右部视图组件
* @prop {function} footer 底部视图组件
* @prop {function} isOtherPerson 其他用户
* @prop {function} slideRight 内容区域右部视图组件是否可滑动，暂不支持三列
* @prop other List Props // List组件所有的属性
* @example
*     <BaseLayout
        left={(props) => <div>左边</div>}
        right={(props) => <div>右边</div>}
      >
        {(props) => <div>中间</div>}
      </BaseLayout>
*/

const Index = forwardRef((props, ref) => {
  const {
    header = null,
    left = null,
    children = null,
    contentHeader = null,
    right = null,
    footer = null,
    onSearch,
    noMore = false,
    onRefresh,
    isOtherPerson = false,
    showLayoutRefresh = true,
    showHeaderLoading = true,
    slideRight = false,
  } = props;

  const [scrollTop, setScrollTop] = useState(0);
  const size = useRef('xl');
  const listRef = useRef(null);
  const handleBacktoTop = () => {
    listRef && listRef.current.onBackTop();
  };

  useImperativeHandle(ref, () => ({
    listRef,
  }));

  const debounce = (fn, wait) => {
    let timer = null;
    return () => {
      if (timer !== null) {
        clearTimeout(timer);
      }
      timer = setTimeout(fn, wait);
    };
  };

  const updateSize = debounce(() => {
    if (window) {
      size.current = calcSize(window.innerWidth);
    }
  }, 50);

  useEffect(() => {
    if (window) {
      window.addEventListener('resize', updateSize);
      return () => {
        window.removeEventListener('resize', updateSize);
      };
    }
  });

  const calcSize = (width = 1600) => {
    let size = 'xl';
    if (width < 992) {
      size = 'sm';
    } else if (width >= 992 && width < 1100) {
      size = 'md';
    } else if (width >= 1100 && width < 1400) {
      size = 'lg';
    } else if (width >= 1440 && width < 1880) {
      size = 'xl';
    } else {
      size = 'xxl';
    }
    return size;
  };

  const showLeft = useMemo(() => left && (size.current === 'xl' || size.current === 'xxl'), [size.current]);

  const showRight = useMemo(() => right && (size.current === 'xl' || size.current === 'xxl' || size.current === 'lg'), [
    size.current,
  ]);

  const [isUploadBackgroundUrl, setBackgroundUrl] = useState(false);

  const handleSetBgLoadingStatus = (bol) => {
    setBackgroundUrl(bol);
  };

  return (
    <div className={styles.container}>
      {(header && header({ ...props })) || <Header onSearch={onSearch} />}
      <List
        {...props}
        platform="pc"
        className={styles.list}
        wrapperClass={`${styles.wrapper} ${slideRight ? styles.slideWrap : ''}`}
        ref={listRef}
        onScroll={({ scrollTop }) => {
          setScrollTop(scrollTop);
        }}
      >
        {(contentHeader && contentHeader({ ...props })) || (
          <div className={styles.headerbox}>
            <div className={styles.userHeader}>
              {!showHeaderLoading && (
                <>
                  <div className={styles.headImgWrapper}>
                    <UserCenterHeaderImage isOtherPerson={isOtherPerson} />
                    {isUploadBackgroundUrl && (
                      <div className={styles.uploadBgUrl}>
                        <div className={styles.uploadCon}>
                          <Icon name="UploadingOutlined" size={12} />
                          <span className={styles.uploadText}>上传中...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <UserCenterHead
                    handleSetBgLoadingStatus={handleSetBgLoadingStatus}
                    platform="pc"
                    isOtherPerson={isOtherPerson}
                  />
                </>
              )}
              {showHeaderLoading && (
                <div className={styles.spinLoading}>
                  <Spin size={16} type="spinner">
                    加载中...
                  </Spin>
                </div>
              )}
            </div>
          </div>
        )}
        {slideRight ? (
          <>
            <div className={styles.center}>
              {typeof children === 'function' ? children({ ...props }) : children}
              {onRefresh && showLayoutRefresh && <RefreshView noMore={noMore} />}
            </div>

            {(right || showRight) && (
              <div className={styles.right}>{typeof right === 'function' ? right({ ...props }) : right}</div>
            )}
          </>
        ) : (
          <div className={styles.content}>
            {showLeft && (
              <div className={styles.left}>
                {typeof left === 'function' ? useCallback(left({ ...props }), []) : left}
              </div>
            )}

            <div className={styles.center}>
              {typeof children === 'function' ? children({ ...props }) : children}
              {onRefresh && showLayoutRefresh && <RefreshView noMore={noMore} />}
            </div>

            {(right || showRight) && (
              <div className={styles.right}>{typeof right === 'function' ? right({ ...props }) : right}</div>
            )}
          </div>
        )}
      </List>

      {scrollTop > 100 && <BacktoTop onClick={handleBacktoTop} />}
      {typeof footer === 'function' ? footer({ ...props }) : footer}
    </div>
  );
});

Index.displayName = 'BaseLayout';

export default Index;
