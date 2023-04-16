// import React, { createRef } from 'react';
// import PullDownRefresh from '@discuzqsdk/design/dist/components/pull-down-refresh/index';
// import ScrollView from '@discuzqsdk/design/dist/components/scroll-view/index';

// import styles from './index.module.scss';
// import { View, Text, Image } from '@tarojs/components'
// /**
//  * 列表组件
//  * @prop {function} onRefresh 刷新事件
//  * @prop {function} onScrollBottom 到达底部事件
//  * @prop {string} containerClassName 覆盖container className 用于设置list高度
//  * @prop {boolean} refreshing 是否刷新中 必填 否则上面刷新块不会消失
//  * @prop {Data[]} data 数据
//  * @prop {function} renderItem 渲染行
//  *  @param {{index:number, data: Data}} args 参数
//  * ...props 其他ScrollView props
//  */
// class List extends React.PureComponent {
//   state = {
//     height: 0,
//   };
//   listRef = createRef();
//   loadHeightCount = 0; // 防止ssr获取dom节点高度失败问题，最多重新获取2次

//   componentDidMount() {
//     this.loadHeight();
//   }

//   loadHeight = () => {
//     const el = this.listRef.current;
//     if (el && el.clientHeight) {
//       this.setState({
//         height: el.clientHeight,
//       });
//     } else if (this.loadHeightCount < 2) {
//       setTimeout(() => {
//         this.loadHeight();
//       }, 100);
//     }
//     this.loadHeightCount += 1;
//   };

//   emptyFunction() {}

//   renderDiv() {
//     return <View />;
//   }

//   render() {
//     const {
//       onRefresh,
//       refreshing,
//       chlidren,
//       data = [],
//       renderItem,
//       onScrollBottom,
//       containerClassName,
//       ...props
//     } = this.props;
//     const { height } = this.state;
//     const { emptyFunction, renderDiv } = this;
//     const composeClassName = `${styles.container} ${containerClassName || styles.list}`;

//     return (
//       <View className={composeClassName} ref={this.listRef}>
//         {!!height && (
//           <PullDownRefresh onRefresh={onRefresh} isFinished={!refreshing} height={height}>
//             <ScrollView
//               height={height}
//               rowCount={data.length}
//               rowData={data}
//               rowRenderer={renderItem || renderDiv}
//               renderBottom={renderDiv}
//               isRowLoaded={emptyFunction}
//               onPullingUp={emptyFunction}
//               onScrollBottom={onScrollBottom}
//               {...props}
//             >
//               {chlidren}
//             </ScrollView>
//           </PullDownRefresh>
//         )}
//       </View>
//     );
//   }
// }

// export default List;
