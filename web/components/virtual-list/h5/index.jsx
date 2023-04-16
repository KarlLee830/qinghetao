import React, { useRef, forwardRef, useState, useEffect } from 'react';
import './index.scss';
import Item from './item';
import BottomView from '../BottomView';
import ObserveItem from './observe-item';

import { getImmutableTypeHeight, getSticksHeight } from '../utils';

import { List, CellMeasurer, CellMeasurerCache, AutoSizer, InfiniteLoader } from 'react-virtualized';
import { inject, observer } from 'mobx-react';
import BacktoTop from '@components/list/backto-top';
// import backtoTopFn from '@common/utils/backto-top';

const immutableHeightMap = {}; // 不可变的高度
let preScrollTop = 0;
let scrollTimer;
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
let loadData = false;

function VList(props, ref) {
  let cache = props.vlist.cache;

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

  const [flag, setFlag] = useState(true);
  const [scrollTop, setScrollTop] = useState(0);
  const winHeight = window.innerHeight;

  // 监听list列表
  useEffect(() => {
    setList([{ type: 'header' }, ...(props.list || []), { type: 'footer' }]);
  }, [props.list?.length]);

  // 监听置顶列表
  useEffect(() => {
    recomputeRowHeights(0);
  }, [props.sticks]);

  useEffect(() => {
    if (listRef) {
      listRef.scrollToPosition(props.vlist.home || 0);
    }
  }, [listRef?.Grid?.getTotalRowsHeight()]);

  // 重新计算指定的行高
  const recomputeRowHeights = (index, updatedData) => {
    // TODO:先临时处理付费后，列表页面内容不更新的的问题
    if (updatedData) {
      list[index] = updatedData;
    }
    listRef?.recomputeRowHeights(index);
  };

  // 获取每一行元素的高度
  const getRowHeight = ({ index }) => {
    const data = list[index];

    if (!data) {
      return 0;
    }

    // // 头部
    // if (data.type === 'header') {
    //   return 165 + 54 + 10 + getSticksHeight(props.sticks);
    // }

    // 底部
    if (data.type === 'footer') {
      if (list.length <= 2) {
        return winHeight - 230 - 65 + 10; // +10 底部tab栏高度计算修正
      }
      return 151;
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
            type="line"
            platform={props.platform}
            copyright
          ></BottomView>
        );
      default:
        return (
          <Item
            data={data}
            isLast={index === list?.length - 2}
            measure={measure}
            recomputeRowHeights={(data) => recomputeRowHeights(index, data)}
            enableCommentList={true}
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
      <CellMeasurer cache={cache} columnIndex={0} key={key} rowIndex={index} parent={parent}>
        {({ measure, registerChild }) => (
          <div
            ref={registerChild}
            key={key}
            style={style}
            data-index={index}
            data-key={key}
            data-id={data.threadId}
            data-height={immutableHeightMap[index]}
          >
            {renderListItem(data.type, data, measure, {
              index,
              key,
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
    // scrollToPosition = scrollTop;
    setScrollTop(scrollTop);
    setFlag(!(scrollTop < preScrollTop));
    preScrollTop = scrollTop;

    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      setFlag(true);
    }, 100);
    props.onScroll && props.onScroll({ scrollTop, clientHeight, scrollHeight, startNum, stopNum });
    if (scrollTop !== 0) {
      props.vlist.setPosition(scrollTop);
    }
    // if (scrollTop + (clientHeight * 4) >= scrollHeight && !loadData) {
    if (scrollTop + clientHeight + 1000 >= scrollHeight && !loadData && !props.noMore) {
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

  const isRowLoaded = ({ index }) => !!list[index];

  const loadMoreRows = () => Promise.resolve();

  const handleBacktoTop = () => {
    // backtoTopFn(scrollTop, (top) => {
    //   setScrollTop(top);
    // });
    listRef && listRef.scrollToPosition(0);
    props.vlist.setPosition(0);
    // setScrollTop(0);
  };

  const clearAllCache = () => {
    cache.clearAll();
  };

  // 自定义扫描数据范围
  const overscanIndicesGetter = ({ cellCount, scrollDirection, overscanCellsCount, startIndex, stopIndex }) => {
    // startNum = startIndex;
    // stopNum = stopIndex;

    // // 往回滚动
    // if (scrollDirection === -1) {
    //   return {
    //     overscanStartIndex: Math.max(0, startIndex),
    //     overscanStopIndex: Math.min(cellCount - 1, stopIndex + overscanCellsCount),
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

  return (
    <div className="page">
      <InfiniteLoader isRowLoaded={isRowLoaded} loadMoreRows={loadMoreRows} rowCount={rowCount}>
        {({ onRowsRendered, registerChild }) => (
          <AutoSizer className="list">
            {({ height, width }) => (
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
                // scrollTop={scrollTop}
                rowCount={rowCount}
                rowHeight={getRowHeight}
                rowRenderer={rowRenderer}
                width={width}
                overscanIndicesGetter={overscanIndicesGetter}
              />
            )}
          </AutoSizer>
        )}
      </InfiniteLoader>

      {scrollTop > winHeight * 2 && <BacktoTop showTabBar={props.showTabBar} h5 onClick={handleBacktoTop} />}
    </div>
  );
}

export default inject('vlist')(observer(forwardRef(VList)));
