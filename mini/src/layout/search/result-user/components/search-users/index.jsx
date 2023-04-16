// import React, { useCallback } from 'react';
// import UserItem from '@components/thread/user-item';
// import List from '../list';

// import styles from './index.module.scss';

// /**
//  * 用户搜索结果
//  * @prop {object[]} data 用户数据
//  * @prop {function} onItemClick 用户点击事件
//  * @prop {function} onRefresh 刷新事件
//  * @prop {function} onFetchMore 上拉加载
//  * @prop {boolean} refreshing  刷新中
//  */
// const SearchUsers = ({ data = [], refreshing, onRefresh, onFetchMore, onItemClick }) => {
//   const renderItem = useCallback(
//     ({ data: _data, index }) => {
//       const item = _data[index];
//       return (
//         <UserItem
//         key={index}
//         title={item.nickname}
//         imgSrc={item.avatar}
//         label={item.groupName}
//         onClick={onItemClick}
//         className={styles.userItem}
//       />
//       );
//     },
//     [onItemClick],
//   );

//   return (
//     <List
//       containerClassName={styles.list}
//       onPullingUp={onFetchMore}
//       data={data}
//       refreshing={refreshing}
//       onRefresh={onRefresh}
//       renderItem={renderItem}
//     />
//   );
// };

// export default React.memo(SearchUsers);
