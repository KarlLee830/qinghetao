// import React, { useCallback } from 'react';

// import ThreadContent from '@components/thread';
// import List from '../list';

// import styles from './index.module.scss';
// import { View, Text, Image } from '@tarojs/components'
// /**
//  * 帖子搜索结果
//  * @prop {object[]} data 帖子数据
//  * @prop {function} onItemClick 帖子点击事件
//  * @prop {function} onRefresh 刷新事件
//  * @prop {function} onFetchMore 上拉加载
//  * @prop {boolean} refreshing  刷新中
//  */
// // TODO 之后通过样式去掉View
// const SearchPosts = ({ data, refreshing, onRefresh, onFetchMore, onItemClick }) => {
//   const renderItem = useCallback(
//     ({ data: _data, index }) => (
//       <View key={index}>
//         <ThreadContent data={_data[index]} onClick={onItemClick} />
//         {index !== data.length - 1 && <View className={styles.hr} />}
//       </View>
//     ),
//     [onItemClick],
//   );

//   return (
//     <List
//       containerClassName={styles.list}
//       data={data}
//       refreshing={refreshing}
//       onRefresh={onRefresh}
//       onScrollBottom={onFetchMore}
//       renderItem={renderItem}
//     />
//   );
// };

// export default React.memo(SearchPosts);
