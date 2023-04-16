import React, { useMemo } from 'react';
import Progress from '@discuzqsdk/design/dist/components/progress/index';
import { IMG_SRC_HOST } from '@common/constants/site';

import styles from './index.module.scss';
import { View, Text, Image } from '@tarojs/components'

// import redpacketMiniImg from '../../../../../web/public/dzq-img/redpacket-mini.png';
// import coinImg from '../../../../../web/public/dzq-img/coin.png';

const coinImg = `${IMG_SRC_HOST}/assets/coin.e66d1d9205f2d6a18b38fe29b733eb109e168504.png`;
const redpacketMiniImg = `${IMG_SRC_HOST}/assets/redpacket-mini.10b46eefd630a5d5d322d6bbc07690ac4536ee2d.png`;

/**
 * 帖子奖励进度条
 * @prop {POST_TYPE} type 类型
 * @prop {string | number} remaining 红包帖子：剩余数量, 赏金帖子：剩余多少元
 * @prop {string | number} received 红包帖子：已领取数量 , 赏金帖子：已发放多少元
 */

const Index = ({ type = POST_TYPE.RED_PACK, remaining = 0, received = 0, condition = 0 }) => {
  const percent = useMemo(() => (Number(received) > 0 ? (Number(received) / (Number(received) + Number(remaining))) * 100 : 0), [remaining, received]);
  let texts = {};
  let className = '';
  let progressTheme = '';

  if (type === POST_TYPE.RED_PACK) {
    texts = {
      remaining: (
        <>
          剩余<Text className={styles.count}>{remaining}</Text>个
        </>
      ),
      received: `已领取${received}个`,
      receive: condition ? '集赞领红包' : '评论领红包',
    };
    className = styles.redPack;
    progressTheme = 'danger';
  } else if (type === POST_TYPE.BOUNTY) {
    texts = {
      remaining: (
        <>
          剩余<Text className={styles.count}>{remaining}</Text>元
        </>
      ),
      received: `已发放${received}元`,
    };
    className = styles.bounty;
    progressTheme = 'default';
  }

  return (
    <View className={`${styles.container} ${className}`}>
      <Progress
        type="circle"
        percent={percent}
        theme={progressTheme}
        lineWidth={12}
        className={styles.progress}
        isShowText={false}
        lineCap="round"
      >
        <View className={styles.content}>
          {type === POST_TYPE.RED_PACK ? (
            <Image className={styles.icon} src={redpacketMiniImg} />
          ) : (
            <Image className={styles.icon} src={coinImg} />
          )}
          <View className={styles.remaining}>{texts.remaining}</View>
          <View className={styles.received}>{texts.received}</View>
          {texts.receive && <View className={styles.receive}>{texts.receive}</View>}
        </View>
      </Progress>
    </View>
  );
};

export const POST_TYPE = {
  RED_PACK: Symbol('红包'),
  BOUNTY: Symbol('赏金'),
};

export default React.memo(Index);
