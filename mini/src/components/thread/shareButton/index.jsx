import { Button, View, Text } from '@tarojs/components'
import React from 'react'
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import styles from './index.module.scss'

const Index = ({
    tipData,
    index,
    item,
    children}
) => {
    const threadId = tipData.threadId
    const thread = index.threads?.pageData || []
    let threadTitle = ''
    for(let i of thread) {
    if(i.threadId == threadId) {
        threadTitle =  i.title
        break
        }
    }
    const shareData = {
        comeFrom:'thread',
        threadId: threadId,
        title:threadTitle,
        path: `/indexPages/thread/index?id=${threadId}`
    }
    return (

    <Button className={styles.fabulous} openType='share' plain='true' data-shareData={shareData} style={styles}>
        {children || (
            <>
            <View className={styles.fabulousIcon}>
            <Icon
            className={`${styles.icon} ${item.type}`}
            name={item.icon}
            >
            </Icon>
          </View>
          <Text className={styles.fabulousPost}>
          {item.name}
          </Text>
          </>
        )}
    </Button>
    )

}

export default React.memo(Index)
