import React, { useState, useRef } from 'react'
import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import Radio from '@discuzqsdk/design/dist/components/radio/index';
import Input from '@discuzqsdk/design/dist/components/input/index';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import DateTimePicker from '../date-time-picker';
import { formatDate } from '@common/utils/format-date';
import { observer, inject } from 'mobx-react';
import styles from './index.module.scss';

const Index = ({ threadPost }) => {

  const data = JSON.parse(JSON.stringify(threadPost.postData));
  const initSubitems = [{
    id: 0,
    content: '',
  }, {
    id: 0,
    content: '',
  }];

  const hasVoteData = data?.vote?.voteTitle;
  const voteId = data?.vote?.voteId || '';

  const [subitems, setSubitems] = useState(hasVoteData ? data.vote.subitems : initSubitems);
  const [title, setTitle] = useState(hasVoteData ? data.vote.voteTitle : '');
  const [type, setType] = useState(hasVoteData ? data.vote.choiceType : 1);
  const [time, setTime] = useState(hasVoteData ? data.vote.expiredAt : formatDate(new Date(new Date().getTime() + 60 * 60 * 1000), 'yyyy/MM/dd hh:mm:ss'));
  const [isTimeShow, setIsTimeShow] = useState(false);

  const timeRef = useRef();

  const openTimePicker = () => { // 开启时间选择框
    const { openModal } = timeRef.current;
    openModal(time);
    setIsTimeShow(true);
  }

  const cancel = () => {
    Taro.navigateBack();
  };

  const vote = () => {
    let subitemsCopy = [...subitems];
    subitemsCopy = subitemsCopy.filter(item => {
      return !!item.content;
    });

    if (!title) {
      Toast.info({ content: '标题不能为空' });
      return;
    }

    if (subitemsCopy.length < 2) {
      Toast.info({ content: '至少需要提供两个有效选项' });
      return;
    }

    if (new Date(time) < new Date()) {
      Toast.info({ content: '投票结束时间必须大于当前时间' });
      return;
    }

    setSubitems(subitemsCopy);

    threadPost.setPostData({
      vote: {
        voteId: voteId,
        voteTitle: title,
        choiceType: type,
        expiredAt: formatDate(time, 'yyyy/MM/dd hh:mm:ss'),
        subitems: subitemsCopy,
      }
    });
    cancel();
  };

  const content = (
    <>
      <View className={styles.wrapper} onClick={e => e.stopPropagation()} style={{overflow: 'hidden', height: isTimeShow ? '100vh' : ''}}>

        <View className={styles['reward-item']}>
          <Text className={styles.left}>标题</Text>
          <View className={styles.right}>
            <Input
              value={title}
              miniType="text"
              mode="text"
              placeholder="标题最多支持25个字"
              maxLength={25}
              onChange={e => setTitle(e.target.value.trim().substr(0, 25))}
            />
          </View>
        </View>

        <View className={styles['reward-item']}>
          <Text className={styles.left} style={{width: '400rpx'}}>
            <Text>投票选项</Text>
            <Text className={styles.tips}>最多支持20个字</Text>
          </Text>
        </View>

        {subitems.map((item, index) => (
          <View className={styles['reward-item']}>
            <Text className={styles.left}>{`${index + 1}.`}</Text>
            <View className={styles.right}>
              <Input
                value={item.content}
                miniType="text"
                mode="text"
                maxLength={20}
                onChange={e => {
                  const arr = [...subitems];
                  arr[index].content = e.target.value.trim().substr(0, 20);
                  setSubitems(arr);
                }}
              />

              {/* 删除选项按钮 */}
              <Icon
                style={{visibility: subitems.length > 2 ? 'visible' : 'hidden'}}
                name="DeleteOutlined"
                className={styles['delete-icon']}
                onClick={(e) => {
                  const arr = [...subitems];
                  arr.splice(index, 1);
                  setSubitems(arr);
                }}
              />
            </View>
          </View>
        ))}

        <View className={`${styles['reward-item']} ${styles['add-btn']}`}>
          <Button
            style={{visibility: subitems.length < 20 ? 'visible' : 'hidden'}}
            onClick={() => {
              const arr = [...subitems];
              arr.push({
                id: 0,
                content: '',
              });
              setSubitems(arr);
            }}>
            <Icon name="PlusOutlined" size={10} />
            <Text style={{marginLeft: '8px'}}>添加选项</Text>
          </Button>
        </View>

        <View className={styles['reward-item']} style={{borderTop: 'none'}}>
          <Text className={styles.left}>投票方式</Text>
          <View className={styles.right}>
            <Radio.Group value={type} onChange={item => setType(item)}>
              <Radio name={1}>单选</Radio>
              <Radio name={2}>多选</Radio>
            </Radio.Group>
          </View>
        </View>

        <View className={styles['reward-item']}>
          <Text className={styles.left}>结束时间</Text>
          <View className={styles.right}>
            <View
              style={{ textAlign: 'right', width: '100%' }}
              onClick={openTimePicker}
            >
              {time}
            </View>
            <View className={styles['time-arrow']}>
              <Icon name="RightOutlined" size={10} />
            </View>
          </View>
        </View>

        {/* 时间选择弹框 */}
        <DateTimePicker
          style={{position: 'fixed'}}
          ref={timeRef}
          onCancel={() => {
            setIsTimeShow(false);
          }}
          onConfirm={(val) => {
            setIsTimeShow(false);
            setTime(formatDate(val, 'yyyy/MM/dd hh:mm:ss'));
          }}
          initValue={() => {}}
          wrap-class="my-class"
          select-item-class="mySelector"
        />

      </View>
      {/* 按钮 */}
      <View className={styles.btn}>
        <Button onClick={cancel}>取消</Button>
        <Button className={styles['btn-confirm']} onClick={vote}>发起投票</Button>
      </View>
    </>
  );


  return content;
};

export default inject('threadPost')(observer(Index));
