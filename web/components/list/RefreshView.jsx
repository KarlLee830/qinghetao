import React from 'react';
import { Spin } from '@discuzqsdk/design';
import styles from './index.module.scss';

/**
 *
 * @param noMore
 * @param loadText
 * @param noMoreText
 * @param isError
 * @param onRefreshPlaceholder
 * @param type noMoreText的样式类型，类型有 line：有下划线、normal：无下划线。
 * @param platform pc or h5端，pc端noMoreText无下划线，h5端noMoreText有下划线。
 * @returns {JSX.Element}
 * @constructor
 */
const RefreshView = ({noMore = false, loadText = '加载更多...', noMoreText = '没有更多内容了', isError = false, onRefreshPlaceholder = null, noMoreType = 'normal' }) => {
    return (
        <div className={`${styles.refreshView}`}>
            {
                !noMore ? (
                    <div className={styles.loading}>
                        <Spin className={styles.spin} size={16} type="spinner"/>
                        <span>{loadText}</span>
                    </div>
                ) : (
                    noMoreType !== 'normal' ? (
                        <div className={styles.lineSty}>
                            <span className={styles.noMoreLeft}></span>
                            <span>{noMoreText}</span>
                            <span className={styles.noMoreRight}></span>
                        </div>) : (<span>{noMoreText}</span>)
                )
            }
        </div>
    );
}

export default React.memo(RefreshView)
