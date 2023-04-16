import React, { useState, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import Checkbox from '@discuzqsdk/design/dist/components/checkbox/index';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Radio from '@discuzqsdk/design/dist/components/radio/index';
import Progress from '@discuzqsdk/design/dist/components/progress/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import { View, Text } from '@tarojs/components'
import CountDown from '@common/utils/count-down';
import { throttle } from '@common/utils/throttle-debounce';
import LoginHelper from '@common/utils/login-helper';
import Router from '@discuzqsdk/sdk/dist/router';
import styles from './index.module.scss';

const CHOICE_TYPE = {
  mutiple: 2, // 多选
  single: 1, // 单选
};
const VoteDisplay = (props = {}) => {
  const { voteData, threadId, page, updateViewCount = () => {} } = props;
  const isDetail = page === 'detail';
  const [voteObj] = voteData;
  const {
    choiceType,
    voteTitle = '',
    subitems = [],
    voteUsers,
    isExpired,
    isVoted,
    expiredAt = '',
    voteId,
  } = voteObj;

  const [isFold, setIsFold] = useState(isDetail);
  const [day, setDay] = useState(0);
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [value, setValue] = useState([]);

  let countDownIns = null;
  useEffect(() => {
    if (!countDownIns) countDownIns = new CountDown();
    return () => {
      countDownIns.stop();
    };
  }, []);

  useEffect(() => {
    if (countDownIns) {
      const time = expiredAt.replace(/-/g, '/');
      countDownIns.start(time, (res) => {
        const { days, hours, minutes } = res;
        setDay(days);
        setHour(hours);
        setMinute(minutes);
      });
    }
  }, [expiredAt]);

  const handleVote = throttle(async () => {
    const { thread, user, index } = props;
    if (!user.isLogin()) {
      LoginHelper.saveAndLogin();
      return;
    }
    if (value.length <= 0) {
      Toast.info({ content: '请先选择投票选项' });
      return;
    }
    const params = {
      threadId,
      vote: {
        id: voteId,
        subitemIds: value,
      },
    };
    const result = await thread.createVote(params);
    const { success, data, msg } = result;
    if (!success) Toast.info({ content: msg });
    else {
      Toast.info({ content: '投票成功' });
      const [tomId] = Object.keys(data);
      const [tomValue] = Object.values(data);
      // 详情页数据更新
      thread.updateThread(tomId, tomValue);
      // 列表页数据更新
      index.updateListThreadIndexes(threadId, tomId, tomValue);
    }
  }, 1000);

  const goToDetail = () => {
    if (threadId && !isDetail) {
      Router.push({ url: `/indexPages/thread/index?id=${threadId}` });
    }
  };


  if (!voteTitle) return null;
  const isVotedEnd = isExpired || isVoted; // 投票是否已结束
  const isMutiple = choiceType === CHOICE_TYPE.mutiple;
  const typeText = isMutiple ? '多选' : '单选';
  const CheckboxRadio = isMutiple ? Checkbox : Radio;

  return (
    <>
      <View className={styles.container}>
        <View className={styles.header} onClick={goToDetail}>
          <View className={styles['header-right']}>
            {voteTitle}
            { isVotedEnd && <Text className={styles['header-right__text']}>（{typeText}）</Text>}
          </View>
          {!isVotedEnd && (
            <View className={styles['header-left']}>
              {voteUsers}人参与
            </View>
          )}
        </View>
        {!isVotedEnd && (
          <>
            <CheckboxRadio.Group className={`${styles.content} ${styles.foldexpend}`} onChange={(val) => {
              if (isMutiple) setValue(val);
              else setValue([val]);
            }}>
              {subitems.map((item, index) => {
                if ((!isFold && index < 5) || isFold) {
                  return <CheckboxRadio key={index} name={item.id}>{item.content}</CheckboxRadio>;
                }
                return null;
              })}
              {
                (subitems?.length > 5 && !isDetail) &&
                <Button full type="primary"
                  className={!isFold ? styles.foldbtn : styles.expandbtn}
                  onClick={() => setIsFold(!isFold)}
                >
                  <Text className={styles['fold-expand']}>{!isFold ? '展开' : '收起'}投票</Text>
                  <Icon name="RightOutlined" size="10"></Icon>
                </Button>
              }
            </CheckboxRadio.Group>
            <View className={styles.footer}>
              <View className={styles.left} onClick={goToDetail}>
                <View className={styles['left-type']}>{typeText}</View>
                <View className={styles['left-time']}>
                距结束 ：<Text className={styles['time-primary']}>{day}</Text>天<Text className={styles['time-primary']}>{hour}</Text>小时<Text className={styles['time-primary']}>{minute}</Text>分
                </View>
              </View>
              <Button type="primary" className={styles.vote} onClick={handleVote}>投票</Button>
            </View>
          </>
        )}
        {isVotedEnd && (
          <View className={styles.content} onClick={goToDetail}>
            {subitems.map((item, index) => {
              if ((!isFold && index < 5) || isFold) {
                const voteCount = parseInt(item.voteRate, 10) > 100 ? 100 : parseInt(item.voteRate, 10);
                return (
                  <View className={styles['result-item']} key={index}>
                    <View className={styles['result-item__header']}>
                      <View className={styles['item-header-left']}>
                        {item.content}
                        {item.isVoted && <Text className={styles.primaryText}>（已选）</Text>}
                      </View>
                      <View className={styles['item-header-right']}>
                        {item.voteCount || 0}票
                        <Text style={{marginLeft: '8px'}}>{item.voteRate}</Text>
                      </View>
                    </View>
                    <Progress percent={voteCount}></Progress>
                  </View>
                );
              }
              return null;
            })}
            {
              (subitems?.length > 5 && !isDetail) &&
              <Button full type="primary"
                className={!isFold ? styles.foldbtn : styles.expandbtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFold(!isFold)
                }}
              >
                <Text className={styles['fold-expand']}>{!isFold ? '展开' : '收起'}</Text>
                <Icon name="RightOutlined" size="10"></Icon>
              </Button>
            }
            <Button full disabled type="primary" className={styles.disabledbtn}>
              {isExpired ? '投票已结束' : '你已投票'}（{voteUsers}人参与投票）
            </Button>
          </View>
        )}
      </View>
    </>
  );
};

export default inject('thread', 'index', 'user')(observer(VoteDisplay));
