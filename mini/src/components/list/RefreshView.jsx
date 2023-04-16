import React from 'react';
import Spin from '@discuzqsdk/design/dist/components/spin/index';
import { View, Text } from '@tarojs/components';

import styles from './index.module.scss';

/**
 *
 * @param noMore
 * @param loadText
 * @param noMoreText
 * @param isError
 * @param type noMoreText的样式类型，类型有 line：有下划线、normal：无下划线。
 * @returns {JSX.Element}
 * @constructor
 */
const RefreshView = ({noMore = false, loadText = '加载更多...', noMoreText = '没有更多内容了', isError = false, type = 'normal' }) => {
    return (
        <View className={styles.refreshView}>
            {
                !noMore ? (
                    <>
                        <Spin className={styles.spin} type="spinner" /> <Text>{loadText}</Text>
                    </>
                ) : (
                type !== 'normal' ? (
                    <View className={styles.lineSty}>
                      <Text className={styles.noMoreLeft}></Text>
                      <Text>{noMoreText}</Text>
                      <Text className={styles.noMoreRight}></Text>
                    </View>) : (<Text>{noMoreText}</Text>)
                )
            }
        </View>
    )
}

export default React.memo(RefreshView)
