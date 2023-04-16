import React, { useRef } from 'react'
import { View, Button, Text } from '@tarojs/components'
import { genParamScheme } from '@server';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Taro, { setClipboardData } from '@tarojs/taro'
import classNames from 'classnames';
import Popup from '@discuzqsdk/design/dist/components/popup/index';
import setUrlParam from '@common/utils/set-url-param';
import styles from './index.module.scss'

const Index = ({ show, onShareClose, user, site, customShareData, inviteCode = '', type }) => {
    const copyOver = useRef(true);

    const shareData = {
        title: customShareData?.title || site.webConfig?.setSite?.siteName || '',
        path: setUrlParam(customShareData?.path  || 'pages/index/index', { inviteCode }),
    };

    const CreateExperienceCard = () => {
        const data = {...site, user }
        onShareClose()
        Taro.eventCenter.once('page:init', () => {
            Taro.eventCenter.trigger('message:experience', data)
        })
        Taro.navigateTo({
            url: `/subPages/create-card/index`,
        })
    }

    const CreateCard = () => {
        const data = {...site, }
        onShareClose()
        Taro.eventCenter.once('page:init', () => {
            Taro.eventCenter.trigger('message:detail', data)
            type === 'invite' && Taro.eventCenter.trigger('message:invite', customShareData);
        })
        Taro.navigateTo({
            url: `/subPages/create-card/index`,
        })
    }

    const CreateScheme = async () => {
        if(!copyOver.current) {
            return;
        }
        try {
            copyOver.current = false;
            const resp = await genParamScheme({
                params: {
                    type: "share_mini",
                    query:{
                        scene : '',
                        inviteCode,
                    }
                }
            });
            if(resp.code !== 0) {
                throw resp;
            }
            setClipboardData({
                data: resp?.data?.openLink,
                fail: (err) => {
                    console.error(err);
                    Toast.error({
                        content: '创建邀请链接失败',
                        duration: 1000,
                    });
                },
                complete: () => {
                    copyOver.current = true;
                }
            })

        } catch (e) {
            Toast.error({
                content: e.msg || e,
            });
            copyOver.current = true;
        }
    }

    return (
      <Popup
        position="bottom"
        visible={show}
        onClose={onShareClose}>
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
                    <View className={styles.moreItem} onClick={CreateScheme}>
                        <View className={styles.icon}>
                            <Icon name='PaperClipOutlined' size={20}>
                            </Icon>
                        </View>
                        <Text className={styles.text}>
                            复制链接
                        </Text>
                    </View>
                    <Button className={styles.moreItem} openType='share' plain='true' data-shareData={shareData} onClick={onShareClose}>
                        <View className={styles.icon}>
                            <Icon name='WeChatOutlined' size={20}>
                            </Icon>
                        </View>
                        <Text className={styles.text}>
                            微信分享
                        </Text>
                    </Button>
                    {
                        user?.isAdmini && (
                            <View className={styles.moreItem} onClick={CreateExperienceCard}>
                                <View className={`${styles.icon} ${styles.experienceIcon}`}>
                                    <Icon name='ExperienceOutlined' size={20}>
                                    </Icon>
                                </View>
                                <Text className={styles.text}>
                                    限时体验卡
                                </Text>
                            </View>
                        )
                    }
                </View>
            </View>
            <View className={styles.button} >
                <Text className={styles.cancel} onClick={onShareClose}>
                    取消
                </Text>
            </View>
        </View>
      </Popup>
    )
}

export default React.memo(Index)
