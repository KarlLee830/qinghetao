import React, { useRef, forwardRef, useState, useEffect } from 'react';
import './index.scss';
import Item from '../h5/item';
import ObserveItem from '../h5/observe-item';
import BottomView from '../BottomView';
import BacktoTop from '@components/list/backto-top';
import { getImmutableTypeHeight, getLogHeight, getSticksHeight, getTabsHeight } from '../utils';

import { List, CellMeasurer, CellMeasurerCache, AutoSizer, InfiniteLoader } from 'react-virtualized';
import { inject, observer } from 'mobx-react';

import layout from './layout.module.scss';

const immutableHeightMap = {}; // 不可变的高度

let preScrollTop = 0;
let scrollTimer;
let loadData = false;
let startNum;
let stopNum;

// 增强cache实例
function extendCache(instance) {
  instance.getDefaultHeight = ({ index, data }) => {
    if (!data) {
      return 0;
    }

    // 获取不可变的元素高度
    const immutableHeight = getImmutableTypeHeight(data);
    immutableHeightMap[index] = immutableHeight;

    const variableHeight = 0;

    const rowHeight = immutableHeight + variableHeight + 10;

    return rowHeight;
  };

  instance.rowHeight = ({ index, data }) => {
    const key = instance._keyMapper(index, 0);
    const height =
      instance._rowHeightCache[key] !== undefined
        ? instance._rowHeightCache[key]
        : instance.getDefaultHeight({ index, data });

    return height;
  };
}

function Home(props, ref) {
  let cache = props.vlist.cache;

  const { platform = 'h5', left, right, top, pageName } = props;

  if (!cache) {
    cache = new CellMeasurerCache({
      fixedWidth: true,
      show: false,
    });

    extendCache(cache);
    props.vlist.setCache(cache);
  }

  const [list, setList] = useState([{ type: 'header' }, ...(props.list || []), { type: 'footer' }]);
  let listRef = useRef(null);
  const rowCount = list.length;
  const [scrollTop, setScrollTop] = useState(0);

  const [flag, setFlag] = useState(true);

  useEffect(() => {
    if (listRef) {
      listRef.scrollToPosition(props.vlist.home || 0);
    }
  }, [listRef?.Grid?.getTotalRowsHeight()]);

  // 监听list列表
  useEffect(() => {
    setList([{ type: 'header' }, ...(props.list || []), { type: 'footer' }]);
  }, [props?.list?.length]);

  // 监听置顶列表
  useEffect(() => {
    recomputeRowHeights(0);
  }, [props.sticks]);

  // 监听更新条数
  useEffect(() => {
    // 有新内容更新虚拟列表数据
    if (!props.visible && recomputeRowHeights) {
      (props.list || []).map((data, index) => recomputeRowHeights(index + 1, data));
    } else recomputeRowHeights(0);
  }, [props.visible]);

  // 重新计算指定的行高
  const recomputeRowHeights = (index, updatedData) => {
    // TODO:先临时处理付费后，列表页面内容不更新的的问题
    if (updatedData) {
      list[index] = updatedData;
    }
    listRef?.recomputeRowHeights && listRef?.recomputeRowHeights(index);
  };

  // 获取每一行元素的高度
  const getRowHeight = ({ index }) => {
    const data = list[index];

    if (!data) {
      return 0;
    }

    // 头部
    // if (data.type === 'header') {
    //   return (
    //     getLogHeight(platform) +
    //     getTabsHeight(platform) +
    //     getSticksHeight(props.sticks, platform) +
    //     (props.visible ? 50 : 0)
    //   );
    // }

    // 底部
    if (data.type === 'footer') {
      return 60;
    }
    return cache.rowHeight({ index, data });
  };

  const renderListItem = (type, data, measure, { index, key, parent, style }) => {
    switch (type) {
      case 'header':
        return (
          <ObserveItem
            key={key}
            measure={() => {
              measure();
            }}
          >
            {props.children}
          </ObserveItem>
        );
      case 'footer':
        return (
          <BottomView
            noMore={props.noMore}
            isError={props.requestError}
            errorText={props.errorText}
            platform={props.platform}
          ></BottomView>
        );
      default:
        return (
          <Item
            key={key}
            data={data}
            isLast={index === list?.length - 2}
            measure={measure}
            recomputeRowHeights={(data) => recomputeRowHeights(index, data)}
            enableCommentList={true}
            canPublish={props.canPublish}
          />
        );
    }
  };

  const rowRenderer = ({ index, key, parent, style }) => {
    const data = list[index];

    if (!data) {
      return '';
    }

    return (
      <CellMeasurer cache={cache} columnIndex={0} key={`${key}-${data._time || ''}`} rowIndex={index} parent={parent}>
        {({ measure, registerChild }) => (
          <div
            ref={registerChild}
            key={`${key}-${data.threadId}-${data._time || ''}`}
            style={style}
            className={layout.center}
            data-index={index}
            data-id={data.threadId}
            data-height={immutableHeightMap[index]}
          >
            {renderListItem(data.type, data, measure, {
              index,
              key: `${key}-${data._time || ''}`,
              parent,
              style,
            })}
          </div>
        )}
      </CellMeasurer>
    );
  };

  // 滚动事件
  const onScroll = ({ scrollTop, clientHeight, scrollHeight }) => {
    setFlag(!(scrollTop < preScrollTop));
    preScrollTop = scrollTop;

    setScrollTop(scrollTop);

    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      setFlag(true);
    }, 100);

    props.onScroll && props.onScroll({ scrollTop, clientHeight, scrollHeight, startNum, stopNum });
    if (scrollTop !== 0) {
      props.vlist.setPosition(scrollTop);
    }

    if (scrollTop + clientHeight + 3000 >= scrollHeight && !loadData && !props.noMore) {
      loadData = true;
      if (props.loadNextPage) {
        const promise = props.loadNextPage();
        if (promise) {
          promise.finally(() => {
            loadData = false;
          });
        } else {
          loadData = false;
        }
      }
    }
  };

  // 自定义扫描数据范围
  const overscanIndicesGetter = ({ cellCount, scrollDirection, overscanCellsCount, startIndex, stopIndex }) => {
    // startNum = startIndex;
    // stopNum = stopIndex;

    // // 往回滚动
    // if (scrollDirection === -1) {
    //   return {
    //     overscanStartIndex: Math.max(0, startIndex),
    //     overscanStopIndex: Math.min(cellCount - 1, stopIndex + 3),
    //   };
    // }
    // return {
    //   overscanStartIndex: Math.max(0, startIndex - overscanCellsCount),
    //   overscanStopIndex: Math.min(cellCount - 1, stopIndex),
    // };

    startNum = startIndex;
    stopNum = stopIndex;

    return {
      overscanStartIndex: Math.max(0, startIndex - overscanCellsCount),
      overscanStopIndex: Math.min(cellCount - 1, stopIndex + overscanCellsCount),
    };
  };

  // 滚动到顶部
  const handleBacktoTop = () => {
    listRef && listRef.scrollToPosition(0);
    props.vlist.setPosition(0);
  };

  const isRowLoaded = ({ index }) => !!list[index];

  const loadMoreRows = () => Promise.resolve();

  return (
    <div className="page">
      <InfiniteLoader isRowLoaded={isRowLoaded} loadMoreRows={loadMoreRows} rowCount={rowCount}>
        {({ onRowsRendered, registerChild }) => (
          <AutoSizer className="list">
            {({ height, width }) => {
              return (
                <div className={`${layout.list} ${layout.fixed}`}>
                  <div className={`baselayout-left ${layout.left}`}>
                    {typeof left === 'function' ? left({ ...props }) : left}
                  </div>

                  <div className={`${layout.top} ${layout.center} top`}>{top}</div>

                  <List
                    ref={(ref) => {
                      listRef = ref;
                      registerChild(ref);
                    }}
                    onScroll={onScroll}
                    deferredMeasurementCache={cache}
                    height={height}
                    overscanRowCount={20}
                    onRowsRendered={(...props) => {
                      onRowsRendered(...props);
                    }}
                    className={layout.scrollArea}
                    // scrollTop={scrollTop}
                    rowCount={rowCount}
                    rowHeight={getRowHeight}
                    rowRenderer={rowRenderer}
                    width={width}
                    overscanIndicesGetter={overscanIndicesGetter}
                  />

                  <div className={`baselayout-right ${layout.right}`}>
                    {typeof right === 'function' ? right({ ...props }) : right}
                  </div>

                  {scrollTop > 100 && <BacktoTop onClick={handleBacktoTop} />}
                </div>
              );
            }}
          </AutoSizer>
        )}
      </InfiniteLoader>
    </div>
  );
}

export default inject('vlist')(observer(forwardRef(Home)));
