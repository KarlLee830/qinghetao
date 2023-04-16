import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import styles from './index.module.scss';
import { Checkbox, Button, Icon, Radio, Progress, Toast } from '@discuzqsdk/design';
import CountDown from '@common/utils/count-down';
import { debounce } from '@common/utils/throttle-debounce';
import LoginHelper from '@common/utils/login-helper';

const CHOICE_TYPE = {
  mutiple: 2, // 多选
  single: 1, // 单选
};
const VoteDisplay = (props = {}) => {
  const { voteData, threadId, page } = props;
  const isDetail = page === 'detail';
  const [isFold, setIsFold] = useState(isDetail);
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
  if (!voteTitle) return null;
  const isVotedEnd = isExpired || isVoted; // 投票是否已结束
  const isMutiple = choiceType === CHOICE_TYPE.mutiple;
  const typeText = isMutiple ? '多选' : '单选';
  const CheckboxRadio = isMutiple ? Checkbox : Radio;

  let countDownIns = null;
  const [day, setDay] = useState(0);
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [value, setValue] = useState([]);
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

  const handleVote = debounce(async () => {
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
    const { success, data = {}, msg } = result;
    if (!success) Toast.info({ content: msg });
    else {
      Toast.info({ content: '投票成功' });
      const [tomId] = Object.keys(data);
      const [tomValue] = Object.values(data);
      thread.updateThread(tomId, tomValue);
      index.updateListThreadIndexes(threadId, tomId, tomValue);

      const { code, data: threadData } = await props.thread.fetchThreadDetail(threadId);
      const { recomputeRowHeights = () => {} } = props;
      recomputeRowHeights(threadData);
    }
  }, 1000);

  const goToDetail = () => {
    if (threadId && !isDetail) {
      props.router.push(`/thread/${threadId}`);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header} onClick={goToDetail}>
          <div className={styles['header-right']}>
            {voteTitle}
            { isVotedEnd && <span className={styles['header-right__text']}>（{typeText}）</span>}
          </div>
          {!isVotedEnd && (
            <div className={styles['header-left']}>
              {voteUsers}人参与
            </div>
          )}
        </div>
        {!isVotedEnd && (
          <>
            <CheckboxRadio.Group
              className={`${styles.content} ${styles.foldexpend}`}
              onChange={(val) => {
                if (isMutiple) setValue(val);
                else setValue([val]);
              }}
            >
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
                    <span className={styles['fold-expand']}>{!isFold ? '展开' : '收起'}投票</span>
                    <Icon name="RightOutlined" size="10"></Icon>
                  </Button>
              }
            </CheckboxRadio.Group>
            <div className={styles.footer}>
              <div className={styles.left} onClick={goToDetail}>
                <div className={styles['left-type']}>{typeText}</div>
                <div className={styles['left-time']}>
                  距结束 ：<span className={styles['time-primary']}>{ day }</span>天<span className={styles['time-primary']}>{hour}</span>小时<span className={styles['time-primary']}>{minute}</span>分
                </div>
              </div>
              <Button type="primary" className={styles.vote} onClick={handleVote}>投票</Button>
            </div>
          </>
        )}
        {isVotedEnd && (
          <div className={styles.content} onClick={goToDetail}>
            {subitems.map((item, index) => {
              if ((!isFold && index < 5) || isFold) {
                const voteCount = parseInt(item.voteRate, 10) > 100 ? 100 : parseInt(item.voteRate, 10);
                return (
                  <div className={styles['result-item']} key={index}>
                    <div className={styles['result-item__header']}>
                      <div className={styles['item-header-left']}>
                        {item.content}
                        {item.isVoted && <span className={styles.primaryText}>（已选）</span>}
                      </div>
                      <div className={styles['item-header-right']}>
                        {item.voteCount || 0}票
                        <span style={{marginLeft: '8px'}}>{item.voteRate}</span>
                      </div>
                    </div>
                    <Progress percent={voteCount}></Progress>
                  </div>
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
                  setIsFold(!isFold);
                }}
              >
                <span className={styles['fold-expand']}>{!isFold ? '展开' : '收起'}</span>
                <Icon name="RightOutlined" size="10"></Icon>
              </Button>
            }
            <Button full disabled type="primary" className={styles.disabledbtn}>
              {isExpired ? '投票已结束' : '你已投票'}（{voteUsers}人参与投票）
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default inject('thread', 'index', 'user')(observer(withRouter(VoteDisplay)));
