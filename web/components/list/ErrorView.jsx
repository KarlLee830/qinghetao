import React from 'react';
import { noop } from '@components/thread/utils';
import styles from './index.module.scss';


const ErrorView = ({ text = '加载失败', onClick = noop }) => {
    return (
        <div className={styles.refreshView} onClick={onClick}>
            {/* <Icon name="RenovateOutlined" className={styles.spin} size={14}/> */}
            {text || '加载失败'}
        </div>
    )
}

export default React.memo(ErrorView)