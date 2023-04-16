import React from 'react';
import { Spin } from '@discuzqsdk/design';
import styles from './index.module.scss';
export default function DynamicLoading(props) {
    const { data, loadComponent = null, style={} } = props;
    return (
        <div style={{...style}} className={styles.loadingBox}>
            {data.error ? <p  className={styles.text}>加载失败，请刷新重试</p> : loadComponent || <Spin color="#c5c6cb" type='spinner'/>}
        </div>
    );
}

