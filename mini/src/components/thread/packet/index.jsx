import React, { useMemo } from 'react';
import { IMG_SRC_HOST } from '@common/constants/site';
import styles from './index.module.scss';
import { View, Text, Image } from '@tarojs/components'
// import redPacketImg from '../../../../../web/public/dzq-img/red-packet.png';
// import rewardQuestion from '../../../../../web/public/dzq-img/reward-question.png'

// import hongbaoMini from '../../../../../web/public/dzq-img/redpacket-mini.png'

const redPacketImg = `${IMG_SRC_HOST}/assets/red-packet.270fbda74e6ea8e566edc39d5774364137b8f24a.png`;
const rewardQuestion = `${IMG_SRC_HOST}/assets/reward-question.fea1a42822220833a0e6caeee552c7abb43cd7d7.png`;
const hongbaoMini = `${IMG_SRC_HOST}/assets/redpacket-mini.10b46eefd630a5d5d322d6bbc07690ac4536ee2d.png`;

/**
 * 帖子红包、悬赏视图
 * @prop {string}  type 判断是红包还是悬赏
 * @prop {string}  condition 判断是集赞领红包还是评论领红包
 */
const Index = ({ money = 0, remainMoney = 0, number, remainNumber, type = 0, onClick, condition = 0 }) => {

  const title = useMemo(() => {
    if (type === 0) {
      return condition === 0 ? '回复领红包' : '集赞领红包'
    }
      return '评论领赏金'

  }, [type])

  const url = useMemo(() => type === 0 ? redPacketImg : rewardQuestion, [type])

  // 格式化金额，保留两位小数，且去除小数点后面的0
  const formatMoney = useMemo(() => {
    const num = Number(money)
    if (!num) {
      return money
    }

    const newNum = num.toFixed(2)
    const regexp = /(?:\.0*|(\.\d+?)0+)$/
    return newNum.replace(regexp, '$1')
  }, [money])

  return (
    // <View className={styles.container} onClick={onClick}>
    //   <View className={styles.wrapper}>
    //     <Image className={styles.img} src={url} />
    //     <Text className={styles.title}>{title}</Text>
    //     <Text className={styles.money}>￥{formatMoney}</Text>
    //   </View>
    // </View>
    <View className={styles.root} onClick={onClick}>
      {
        type === 0 ? (
          <View className={styles.hongbao_box}>
            <View className={styles.hongbao}>
              <View className={styles.left}>
                <View className={styles.top}> {condition === 0 ? '回复领红包' : '集赞领红包'}</View>
                {
                  number && number * 1 > 0 && (<View className={styles.bottom}>
                    已领取{(number - remainNumber).toFixed(0)}个红包，剩余{remainNumber}个红包
                  </View>)
                }
              </View>
              <View className={styles.right}><View className={styles.pie}><Image className={styles.miniIcon} src={hongbaoMini}></Image></View></View>
            </View>
          </View>
        ) : (
          <View className={styles.xuanshang_box}>
            <View className={styles.xuanshang}>
              <View className={styles.left}>
                {
                  money ? (
                    <View>
                      <View className={styles.remain}>剩余{remainMoney}元</View>
                      <View className={styles.cur}>已发放{(money - remainMoney).toFixed(2)}元</View>
                    </View>
                  ) : (
                    <View className={styles.mid}>评论领赏金</View>
                  )
                }
              </View>
              <View className={styles.right}><View className={styles.shang}>赏</View></View>
            </View>
          </View>
        )
      }
    </View>
  );
}

export default React.memo(Index)

