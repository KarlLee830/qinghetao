import React from 'react';
import ErrorView from './ErrorView';
import RefreshView from './RefreshView';
import { noop } from '@components/thread/utils';
import { View } from '@tarojs/components';

import styles from './index.module.scss';

/**
 *
 * @param {function} handleError 处理点击报错信息
 * @returns
 */
const Index = ({
    isError = false,
    noMore = false,
    loadingView = null,
    errorView = null,
    loadingText = '加载更多...',
    noMoreText = '没有更多内容了',
    errorText = '加载失败',
    type = 'normal',
    handleError = noop,
    isBox = false,
    className=''
}) => (
        <View className={`${styles.bottomView} ${className} ${isBox ? styles.bottomViewBox : ''}`}>
            {!isError ? (
                loadingView || <RefreshView noMore={noMore} loadText={loadingText} noMoreText={noMoreText} type={type} />
            ) : (
                errorView || <ErrorView text={errorText || '加载失败'} onClick={handleError} />
            )}
        </View>
    )

export default React.memo(Index)
