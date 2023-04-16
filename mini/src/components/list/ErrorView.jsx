import React from 'react';
import { noop } from '@components/thread/utils';
import styles from './index.module.scss';
import { Text } from '@tarojs/components';


const ErrorView = ({ text = '加载失败', onClick = noop }) => {
    return (
        <Text className={styles.refreshView} onClick={onClick}>
            {/* <Icon name="RenovateOutlined" className={styles.spin} size={14}/> */}
            {text}
        </Text>
    )
}

export default React.memo(ErrorView)