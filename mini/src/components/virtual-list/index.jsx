import React, { useEffect, useRef } from 'react';
import { getWindowHeight } from './utils';
import List from './List';
import { observer } from 'mobx-react';


/**
 * 列表组件，集成上拉刷新能力
 * @prop {function} height 容器高度
 * @prop {function} className 容器样式
 * @param {string} noMore 无更多数据
 * @prop {function} onRefresh 触底触发事件，需返回promise
 * @prop {function} showRefresh 是否启用上拉刷新
 */
const VirtualList = ({
  data,
  isClickTab,
  wholePageIndex,
}) => {
  const windowHeight = useRef(null)
  const listRef = useRef(null)


//   通知子组件去监听
  useEffect(() => {
    if (data?.length && listRef?.current) {
        const length = data.length - 1
        const { displays } = listRef.current.state
        if (data?.length > displays?.length) {
            setTimeout(() => {
                listRef?.current?.observePage(length)
            }, 10);
        }
    }
  }, [data, listRef?.current])

  // 获取屏幕高度
  useEffect(() => {
    getWindowHeight().then((res) => {
      windowHeight.current = res
    })
  }, [])



  const dispatch = (threadId, updatedThreadData) => {
    // if(!threadId || !updatedThreadData) return;

    // let newArr = [ ...dataSource ];
    // newArr.forEach((subArr) => {
    //   for(let i = 0; i < subArr.length; i++) {
    //     if(subArr[i].threadId === threadId) {
    //       subArr[i] = updatedThreadData;
    //       break;
    //     }
    //   }
    // });
    // setDataSource(newArr);
  }

  return (
      <>
        {
            (!isClickTab && data.length > 0) && <List 
                ref={(e) => { listRef.current = e }}
                dataSource={data} 
                wholePageIndex={wholePageIndex} 
                windowHeight={windowHeight.current} 
                dispatch={dispatch}
                isClickTab={isClickTab}
            />
        }
      </>
    
  );
}

export default observer(VirtualList);
