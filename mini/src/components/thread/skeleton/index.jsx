import React from 'react';
import styles from './index.module.scss';
import { View } from '@tarojs/components'

const Index = ({ style }) => {
    return (
        <View className={styles.container} style={style}>
            <View className={styles.header}>
                <View className={styles.img}></View>

                <View>
                    <View className={styles.title}></View>
                    <View className={styles.subTitle}></View>
                </View>
            </View>

            <View className={styles.content}></View>
            
            <View className={styles.footer}>
                {
                    new Array(3).fill('').map((_, index) => <View key={index} className={styles.bottom}></View>)
                }
            </View>
        </View>
    )
}

export default React.memo(Index)