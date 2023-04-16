
import React, { useState, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import Taro, { getCurrentInstance } from '@tarojs/taro';
import { View } from '@tarojs/components';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Input from '@discuzqsdk/design/dist/components/input/index';
import Radio from '@discuzqsdk/design/dist/components/radio/index';
import Slider from '@discuzqsdk/design/dist/components/slider/index';
import { THREAD_TYPE } from '@common/constants/thread-post';
import throttle from '@common/utils/thottle';
import PartPaid from './part-paid';

import styles from './index.module.scss';

const Paid = inject('threadPost')(observer((props) => {
  // props state
  const { params: { paidType } } = getCurrentInstance().router;
  const isPost = parseInt(paidType) === THREAD_TYPE.paidPost; // 全帖付费
  const isAttach = parseInt(paidType) === THREAD_TYPE.paidAttachment; // 附件付费
  const isAudio = parseInt(paidType) === THREAD_TYPE.voice; // 音频付费
  const [price, setPrice] = useState(''); // 全帖价格\附件价格\音频价格
  const [freeWords, setFreeWords] = useState(1); // 免费查看百分比
  const [freeAudio, setFreeAudio] = useState(false); // 默认音频不免费
  const [refresh, setRefresh] = useState(true); // 手动刷新页面

  const { threadPost } = props;
  const { partPayInfo } = threadPost;
  // Hook
  useEffect(() => { // 初始化
    const { postData } = props.threadPost;
    if (isPost) {
      postData.price && setPrice(postData.price);
      setFreeWords(parseInt(Number(postData.freeWords) * 100));
    }

    if (isAttach) {
      props.threadPost.setPartPayFromPostData();
    }

    if (isAudio) {
      postData.audio?.price && setPrice(postData.audio?.price);
    }
  }, [])

  useEffect(() => {
    isAudio && price !== "" && freeAudio && setFreeAudio(false);
  }, [price])

  // handle
  const handleRadioChange = (val) => { // 切换音频是否付费
    val && setPrice("");
    setFreeAudio(val)
  }

  const handlePrice = (val) => {
    const arr = val.match(/([1-9]\d{0,5}|0)(\.\d{0,2})?/);
    setPrice(arr ? arr[0] : '');
    setRefresh(!refresh);
  }

  const checkState = () => {
    if (isAttach) {
      const partPayPrice = partPayInfo.payPrice;
      if (!partPayPrice) {
        Taro.showToast({ title: '请输入付费金额', icon: 'none', duration: 2000 })
        return false;
      }

      if (parseFloat(partPayPrice) < 0.1) {
        Taro.showToast({ title: '付费金额最低0.1元', icon: 'none', duration: 2000 })
        return false;
      }

      if (parseFloat(partPayPrice) > 100000) {
        Taro.showToast({ title: '付费金额最高10w元', icon: 'none', duration: 2000 })
        return false;
      }
    }

    if (isPost) {
      if (!price) {
        Taro.showToast({ title: '请输入付费金额', icon: 'none', duration: 2000 })
        return false;
      }

      if (parseFloat(price) < 0.1) {
        Taro.showToast({ title: '付费金额最低0.1元', icon: 'none', duration: 2000 })
        return false;
      }

      if (parseFloat(price) > 100000) {
        Taro.showToast({ title: '付费金额最高10w元', icon: 'none', duration: 2000 })
        return false;
      }
    }

    return true;
  }

  const paidCancel = () => { // 取消、返回发帖页
    Taro.navigateBack();
  }

  const paidConfirm = () => { // 确认
    // 1 校验
    if (!checkState()) return;

    // 2 update store
    const { setPostData, postData } = props.threadPost;
    if (isPost) {
      setPostData({ price: parseFloat(price), freeWords: freeWords / 100 });
    }
    if (isAttach) {
      props.threadPost.setPartPayInfo();
    }

    // 3 go back
    paidCancel();
  };

  const postComponent = () => (
      <>
        <View className={styles['paid-item']}>
          <View className={styles.left}>支付金额</View>
          <View className={styles.right}>
            <Input
              mode="number"
              miniType="digit"
              value={price}
              placeholder="金额"
              maxLength={9}
              onChange={e => handlePrice(e.target.value)}
            />&nbsp;元
          </View>
        </View>
        <View className={styles.free}>
          <View className={styles['free-title']}>免费查看字数</View>
          <Slider
            value={freeWords}
            defaultValue={freeWords}
            formatter={value => `${value} %`}
            onChange={throttle(e => setFreeWords(e), 100)}
          />
        </View>
      </>
    )

  const attachmentComponent = () => (
      <View className={styles['paid-wrapper']}>
        <PartPaid />
      </View>
    )

  return (
    <View className={styles.wrapper}>
      {/* content */}
      {isPost && postComponent()}
      {isAttach && attachmentComponent()}
      {/* button */}
      <View className={styles.btn}>
        <Button onClick={paidCancel}>取消</Button>
        <Button className={styles['btn-confirm']} onClick={paidConfirm}>确定</Button>
      </View>
    </View>
  );
}))

export default Paid;

