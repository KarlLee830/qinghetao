// import React, { useCallback } from 'react';

// import { Topic } from '@components/search-result-item';
// import List from '../list';

// import styles from './index.module.scss';

// /**
//  * 话题搜索结果
//  * @prop {object[]} data 话题数据
//  * @prop {function} onItemClick 话题点击事件
//  * @prop {function} onRefresh 刷新事件
//  * @prop {function} onFetchMore 上拉加载
//  * @prop {boolean} refreshing  刷新中
//  */
// const SearchTopics = ({ data = [], refreshing, onRefresh, onFetchMore, onItemClick }) => {
//   const renderItem = useCallback(
//     ({ data: _data, index }) => <Topic key={index} data={_data[index]} onClick={onItemClick} />,
//     [onItemClick],
//   );

//   return (
//     <List
//       containerClassName={styles.list}
//       data={data}
//       refreshing={refreshing}
//       onRefresh={onRefresh}
//       onPullingUp={onFetchMore}
//       renderItem={renderItem}
//     />
//   );
// };

// export default SearchTopics;
