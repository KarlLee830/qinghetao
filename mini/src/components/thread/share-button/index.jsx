import React from 'react'
import { View, Button, Text } from '@tarojs/components'
import styles from './index.module.scss'
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Taro, { useEffect, useDidShow } from '@tarojs/taro'
import classNames from 'classnames';
import Popup from '@discuzqsdk/design/dist/components/popup/index';

const Index = ({show, setShow, data = '', getShareData, shareNickname, shareAvatar, shareThreadid, onShare}) => {
    let threadTitle = ''
    const thread = data
    threadTitle = thread?.title
    const {threadId} = thread || ''
    const shareData = {
        comeFrom:'thread',
        threadId,
        title:threadTitle,
        path: `/indexPages/thread/index?id=${threadId}`,
        isAnonymous: thread.isAnonymous,
        isPrice: thread?.displayTag?.isPrice,
    }
    const handleClick = () => {
        setShow(false)
        const {nickname} = thread.user || ''
        const {avatar} = thread.user || ''
        if(thread.isAnonymous) {
            getShareData({nickname, avatar, threadId})
            thread.user.nickname = '匿名用户'
            thread.user.avatar = ''
        }
    }
    const CreateCard = () => {
        setShow(false)
        onShare()
        Taro.eventCenter.once('page:init', () => {
            Taro.eventCenter.trigger('message:detail', data)
        })
        Taro.navigateTo({
            url: `/subPages/create-card/index`,
        })
    }
    const onClose = () => {
        setShow(false)
    }
    // 当页面被隐藏时（去分享）,收起弹窗
    // TODO 最好是做成点击按钮之后，就收起弹窗
    useDidShow(() => {
        if(shareThreadid === threadId) {
            if(thread.isAnonymous){
                thread.user.nickname = shareNickname
                thread.user.avatar = shareAvatar
                getShareData({})
            }
        }
    })
    return (
      <Popup
        position="bottom"
        visible={show}
        onClose={onClose}>
        <View className={styles.body}>
            <View className={styles.container}>
            <View className={classNames(styles.more, styles.oneRow)}>
                <View className={styles.moreItem} onClick={CreateCard}>
                    <View className={styles.icon}>
                        <Icon name='PictureOutlinedBig' size={20}>
                        </Icon>
                    </View>
                    <Text className={styles.text}>
                        生成海报
                    </Text>
                </View>
                <Button className={styles.moreItem} openType='share' plain='true' data-shareData={shareData} onClick={handleClick}>
                    <View className={styles.icon}>
                        <Icon name='WeChatOutlined' size={20}>
                        </Icon>
                    </View>
                    <Text className={styles.text}>
                        微信分享
                    </Text>
                </Button>
            </View>
        </View>
        <View className={styles.button} >
                <Text className={styles.cancel} onClick={onClose}>
                    取消
                </Text>
            </View>
        </View>
        </Popup>
    )
}

export default React.memo(Index)
